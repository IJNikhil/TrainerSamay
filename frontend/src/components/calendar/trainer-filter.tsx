"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import type { User } from '../../lib/types';

interface TrainerFilterProps {
  trainers: User[];
  selectedTrainerId: string;
  onTrainerChange: (trainerId: string) => void;
}

export default function TrainerFilter({ trainers, selectedTrainerId, onTrainerChange }: TrainerFilterProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="trainer-filter">Filter by Trainer:</Label>
      <Select value={selectedTrainerId} onValueChange={onTrainerChange}>
        <SelectTrigger id="trainer-filter" className="w-[180px]">
          <SelectValue placeholder="Select trainer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Trainers</SelectItem>
          {trainers.map(trainer => (
            <SelectItem key={trainer.id} value={trainer.id}>
              {trainer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
