# User Roles & Permissions

## Role Overview

The platform has 4 distinct roles with different access levels:

---

## 1. Admin
**Full platform control**

### Permissions
✅ Manage all users (approve/reject/delete)  
✅ Create and manage tournaments  
✅ Create and manage auctions  
✅ Control auction flow (start/pause/resume/next player)  
✅ Add/edit/delete players  
✅ View all teams and bids  
✅ Access audit logs  
✅ Manage system settings  
✅ Override any action  

### Use Case
Platform owner, system administrator

---

## 2. Organizer
**Tournament management**

### Permissions
✅ Create tournaments  
✅ Edit own tournaments  
✅ Create auctions for own tournaments  
✅ Control auction flow (start/pause/resume/next)  
✅ Add players to auction  
✅ Approve team registrations  
✅ View bids and results  
✅ Generate reports  

❌ Cannot manage other organizers' tournaments  
❌ Cannot access system settings  
❌ Cannot delete users  

### Use Case
Event organizer, league manager

---

## 3. Team Owner
**Bidding participant**

### Permissions
✅ Register teams for tournaments  
✅ Place bids during auctions  
✅ View own team roster  
✅ View own bid history  
✅ View remaining budget  
✅ Watch live auctions  
✅ View tournament rules  

❌ Cannot control auction flow  
❌ Cannot see other teams' budgets  
❌ Cannot add/edit players  
❌ Cannot create tournaments  

### Use Case
Team owner, bidder

---

## 4. Spectator
**View-only access**

### Permissions
✅ Watch live auctions  
✅ View tournament details  
✅ View player information  
✅ View final team rosters  
✅ View auction results  

❌ Cannot place bids  
❌ Cannot register teams  
❌ Cannot create tournaments  
❌ Cannot access any management features  

### Use Case
Fans, viewers, media

---

## Permission Matrix

| Feature | Admin | Organizer | Team Owner | Spectator |
|---------|-------|-----------|------------|-----------|
| **User Management** |
| Approve users | ✅ | ❌ | ❌ | ❌ |
| View all users | ✅ | ✅ | ❌ | ❌ |
| **Tournament Management** |
| Create tournament | ✅ | ✅ | ❌ | ❌ |
| Edit tournament | ✅ | ✅ (own) | ❌ | ❌ |
| Delete tournament | ✅ | ❌ | ❌ | ❌ |
| View tournaments | ✅ | ✅ | ✅ | ✅ |
| **Auction Management** |
| Create auction | ✅ | ✅ | ❌ | ❌ |
| Start/pause auction | ✅ | ✅ (own) | ❌ | ❌ |
| Next player | ✅ | ✅ (own) | ❌ | ❌ |
| View auction | ✅ | ✅ | ✅ | ✅ |
| **Team Management** |
| Register team | ✅ | ✅ | ✅ | ❌ |
| Approve team | ✅ | ✅ (own tournament) | ❌ | ❌ |
| View own team | ✅ | ✅ | ✅ | ❌ |
| View all teams | ✅ | ✅ | ❌ | ✅ (after auction) |
| **Bidding** |
| Place bid | ✅ | ❌ | ✅ | ❌ |
| View own bids | ✅ | ✅ | ✅ | ❌ |
| View all bids | ✅ | ✅ | ❌ | ✅ (after auction) |
| **Player Management** |
| Add player | ✅ | ✅ | ❌ | ❌ |
| Edit player | ✅ | ✅ | ❌ | ❌ |
| Delete player | ✅ | ❌ | ❌ | ❌ |
| View players | ✅ | ✅ | ✅ | ✅ |
| **Reports & Logs** |
| Audit logs | ✅ | ❌ | ❌ | ❌ |
| Tournament reports | ✅ | ✅ (own) | ❌ | ❌ |
| Team reports | ✅ | ✅ | ✅ (own) | ❌ |

---

## Default Credentials

### Admin Account (Pre-seeded)
```
Email: admin@auction.com
Password: admin123
Role: admin
```

---

## Registration Flow

### For Team Owners
1. Register via `/api/v1/auth/register`
2. Wait for admin/organizer approval
3. Once approved (`is_approved = true`), can register teams
4. Join tournaments and start bidding

### For Organizers
1. Register via `/api/v1/auth/register`
2. Admin assigns `organizer` role
3. Can create tournaments and manage auctions

### For Spectators
1. Register via `/api/v1/auth/register`
2. Automatic `spectator` role
3. View-only access to all public content

---

## Role Assignment

Roles are assigned via the `user_roles` junction table:
- Users can have **multiple roles**
- Example: A user can be both `organizer` and `team_owner`
- Admin assigns roles through user management interface

---

## API Authorization

### JWT Token
All authenticated requests require JWT token in header:
```
Authorization: Bearer <token>
```

### Role-Based Access Control (RBAC)
Backend validates user roles before allowing actions:
```python
@require_role(["admin", "organizer"])
async def create_tournament(...):
    # Only admin and organizer can access
```

### WebSocket Authentication
WebSocket connections require token in query param:
```
ws://domain/ws/auction/{id}?token=<jwt_token>
```
