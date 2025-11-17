import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import type { TeamBudgetSnapshot } from '../types';
import { Card } from './Card';

interface TeamBudgetsProps {
  budgets: TeamBudgetSnapshot[];
}

export const TeamBudgets: React.FC<TeamBudgetsProps> = ({ budgets }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Team Budgets</h3>
      </div>
      
      <div className="space-y-3">
        {budgets.map((team) => {
          const budgetPercentage = (team.remaining_budget / team.budget) * 100;
          const isLow = budgetPercentage < 20;
          return (
            <div key={team.team_id} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{team.team_name}</span>
                  {isLow && <AlertTriangle className="w-4 h-4 text-red-600" />}
                </div>
                <span className={`text-sm ${
                  isLow ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}>
                  ₹{team.remaining_budget.toLocaleString()} / ₹{team.budget.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isLow ? 'bg-red-600' : budgetPercentage < 50 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
