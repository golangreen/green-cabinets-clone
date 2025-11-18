/**
 * Cursor Overlay Component
 * Shows other users' cursor positions in real-time
 */

import { CollaborationUser } from './useCollaboration';

interface CursorOverlayProps {
  users: CollaborationUser[];
}

export const CursorOverlay = ({ users }: CursorOverlayProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {users.map((user) => {
        if (!user.cursorPosition) return null;

        return (
          <div
            key={user.userId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: `${user.cursorPosition.x}px`,
              top: `${user.cursorPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: user.color }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill="currentColor"
              />
            </svg>

            {/* User label */}
            <div
              className="absolute top-6 left-0 text-xs font-medium px-2 py-1 rounded whitespace-nowrap"
              style={{
                backgroundColor: user.color,
                color: '#fff',
              }}
            >
              {user.email}
            </div>
          </div>
        );
      })}
    </div>
  );
};
