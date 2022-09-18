  
  export const formatNumber = (numberValue: any, speractor: string = '\'') => numberValue?.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join(speractor);

  export const formatSquare = (value, prefix = '', append = '') => value && `${prefix} ${formatNumber(value)} m² ${append}`

  export const formatCurrency = (value, unit) => value && `${unit} ${formatNumber(value)}`
