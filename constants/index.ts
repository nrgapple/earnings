export const CompanyMetrics = {
  income: [
    { tag: ['Revenues'], name: 'Revenue YoY Growth' },
    {
      tag: ['GrossProfit', 'NetIncome', 'NetIncomeLoss'],
      name: 'Net Income Increasing',
    },
    {
      tag: ['NetCashFlowsOperating'],
      name: 'Operating Cashflow Increasing',
    },
  ],
} as const
