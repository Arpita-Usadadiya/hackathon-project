// Utility helper functions boilerplate for VendorBridge ERP

export const formatCurrency = (amount) => {
  // TODO: Format currency as INR (e.g. ₹55,000.00)
  return `₹${amount || 0}`;
};

export const formatDate = (dateString) => {
  // TODO: Format dateString into readable format (e.g. 06 Jun 2026)
  return dateString || 'N/A';
};

export const validateGSTIN = (gstin) => {
  // TODO: Implement GSTIN validation (alphanumeric, 15-chars long)
  return gstin && gstin.length === 15;
};

export const exportToCSV = (data, filename = 'report.csv') => {
  // TODO: Generate CSV content from data array and trigger download in browser
  console.log('Exporting CSV data:', data);
};
