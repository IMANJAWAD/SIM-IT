import { showAlert, showConfirm, showSuccess, showWarning, showError, showInfo } from './CustomAlert';

const AlertDemo = () => {
  const testAlerts = () => {
    // Test different alert types
    showSuccess('Operation completed successfully!', {
      title: 'Success',
      duration: 3000
    });

    setTimeout(() => {
      showWarning('This is a warning message', {
        title: 'Warning',
        duration: 4000
      });
    }, 1000);

    setTimeout(() => {
      showError('An error occurred during processing', {
        title: 'Error',
        autoClose: false
      });
    }, 2000);

    setTimeout(() => {
      showInfo('Here is some important information', {
        title: 'Information',
        duration: 5000
      });
    }, 3000);
  };

  const testConfirm = async () => {
    const result = await showConfirm('Are you sure you want to delete this item?', {
      title: 'Confirm Deletion',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    });
    
    if (result) {
      showSuccess('Item deleted successfully!');
    } else {
      showInfo('Deletion cancelled');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={testAlerts}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Test All Alert Types
      </button>
      
      <button
        onClick={testConfirm}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Test Confirmation Dialog
      </button>
    </div>
  );
};

export default AlertDemo;