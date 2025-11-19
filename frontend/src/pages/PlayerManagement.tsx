import React, { useEffect, useState, useRef } from 'react';
import { playerApi } from '../services/api';
import type { Player } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';
import { Plus, X, Edit2, Trash2, Search, Upload } from 'lucide-react';
import { getNavigationLinks } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { authApi } from '../services/api';

export const PlayerManagement: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  
  const [name, setName] = useState('');
  const [sport, setSport] = useState('Cricket');
  const [position, setPosition] = useState('');
  const [basePrice, setBasePrice] = useState('100000');
  const [reservePrice, setReservePrice] = useState('');
  const [rating, setRating] = useState('7.0');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, positionFilter]);

  const loadPlayers = async () => {
    try {
      const { data } = await playerApi.list();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    }
  };

  const filterPlayers = () => {
    let filtered = players;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (positionFilter !== 'all') {
      filtered = filtered.filter(p => p.position === positionFilter);
    }
    
    setFilteredPlayers(filtered);
  };

  const handleSave = async () => {
    if (!name || !position) return;

    setLoading(true);
    try {
      if (editingPlayer) {
        await playerApi.update(editingPlayer.id, {
          name,
          sport,
          position,
          base_price: parseFloat(basePrice),
          reserve_price: reservePrice ? parseFloat(reservePrice) : undefined,
          rating: parseFloat(rating),
          image_url: imageUrl || undefined,
        });
      } else {
        await playerApi.create({
          name,
          sport,
          position,
          base_price: parseFloat(basePrice),
          reserve_price: reservePrice ? parseFloat(reservePrice) : undefined,
          rating: parseFloat(rating),
          image_url: imageUrl || undefined,
        });
      }
      resetForm();
      loadPlayers();
    } catch (err) {
      console.error('Failed to save player:', err);
      alert('Failed to save player');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setSport(player.sport);
    setPosition(player.position || '');
    setBasePrice(player.base_price.toString());
    setReservePrice(player.reserve_price?.toString() || '');
    setRating(player.rating?.toString() || '7.0');
    setImageUrl(player.image_url || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    
    try {
      await playerApi.delete(id);
      loadPlayers();
    } catch (err) {
      console.error('Failed to delete player:', err);
      alert('Failed to delete player');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setName('');
    setSport('Cricket');
    setPosition('');
    setBasePrice('100000');
    setReservePrice('');
    setRating('7.0');
    setImageUrl('');
  };

  const positions = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'];

  const { user } = useAuthStore();
  const nav = getNavigationLinks(user?.roles || []);

  return (
    <LayoutWithSidebar links={nav.links} title={nav.title}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Player Pool</h1>
          <p className="text-gray-600">Manage players for auctions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search players..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{player.name}</h3>
                  <p className="text-sm text-gray-500">{player.position}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(player)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(player.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold">₹{player.base_price.toLocaleString()}</span>
                </div>
                {player.reserve_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reserve:</span>
                    <span className="font-semibold text-orange-600">₹{player.reserve_price.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold">{player.rating || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No players found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingPlayer ? 'Edit Player' : 'Add Player'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Position *</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reserve Price (₹)</label>
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  placeholder="Minimum selling price"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Player Photo</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2" placeholder="Photo URL or upload" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="secondary" className="w-full"><Upload className="h-4 w-4 mr-2" />{uploading ? 'Uploading...' : 'Upload Photo'}</Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { addToast('Please select an image file', 'error'); return; } if (file.size > 5 * 1024 * 1024) { addToast('File size must be less than 5MB', 'error'); return; } setUploading(true); try { const { data } = await authApi.uploadPhoto(file); setImageUrl(data.photo_url); addToast('Photo uploaded successfully', 'success'); } catch (err) { addToast('Failed to upload photo', 'error'); } finally { setUploading(false); } }} className="hidden" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading || !name || !position} className="flex-1">
                  {loading ? 'Saving...' : editingPlayer ? 'Update' : 'Add Player'}
                </Button>
                <Button onClick={resetForm} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWithSidebar>
  );
};
