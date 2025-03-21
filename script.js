function showModal(type) {
  // Hide all modals first
  document.getElementById('staff-modal').style.display = 'none';
  document.getElementById('announcements-modal').style.display = 'none';
  document.getElementById('server-modal').style.display = 'none';

  // Show the selected modal
  if (type === 'staff') {
      document.getElementById('staff-modal').style.display = 'block';
  } else if (type === 'announcements') {
      document.getElementById('announcements-modal').style.display = 'block';
  } else if (type === 'server') {
      document.getElementById('server-modal').style.display = 'block';
  }
}

function closeModal() {
  // Close all modals
  document.getElementById('staff-modal').style.display = 'none';
  document.getElementById('announcements-modal').style.display = 'none';
  document.getElementById('server-modal').style.display = 'none';
}
