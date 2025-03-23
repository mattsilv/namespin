"use client";

import React, { useState } from "react";

interface ParticipantsListProps {
  participants: string[];
  isSpinning: boolean;
  onRemove: (index: number) => void;
  onAdd?: (name: string) => void;
}

export default function ParticipantsList({
  participants,
  isSpinning,
  onRemove,
  onAdd,
}: ParticipantsListProps) {
  const [newName, setNewName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && onAdd) {
      onAdd(newName.trim());
      setNewName("");
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-2">
        Participants ({participants.length})
      </h2>

      {/* Add participant form */}
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter name..."
          disabled={isSpinning}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSpinning || !newName.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
        >
          Add
        </button>
      </form>

      {/* Participants list */}
      <ul className="border rounded-md divide-y">
        {participants.length === 0 ? (
          <li className="px-4 py-2 text-center text-gray-500">
            No participants yet. Add some names above.
          </li>
        ) : (
          participants.map((name, index) => (
            <li
              key={index}
              className="px-4 py-2 flex justify-between items-center"
            >
              <span>{name}</span>
              {!isSpinning && (
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemove(index)}
                >
                  Remove
                </button>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Placeholder for the add participant UI */}
      {/* We'll add this in a future enhancement */}
      <div className="mt-4 text-gray-500 text-center">
        <p>Future enhancement: Add participants form</p>
      </div>
    </div>
  );
}
