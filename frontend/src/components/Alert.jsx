import React from 'react';

const Alert = ({ type, message }) => {
  if (!message) return null;

  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  else if (type === 'error') icon = 'cancel';
  else if (type === 'warning') icon = 'warning';

  return (
    <div className={`g-alert ${type}`}>
      <span className="material-icons-round">{icon}</span>
      {message}
    </div>
  );
};

export default Alert;
