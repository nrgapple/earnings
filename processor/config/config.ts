import { ReportPretty } from '../types'

export const ratios = {
  ReturnOnAssets: {
    tags: ['NetIncomeLoss', 'Assets'] as const,
    callback: (netIncomeReport: ReportPretty, assetReport: ReportPretty) => {
      if (!netIncomeReport || !assetReport) return undefined
      return {
        start: netIncomeReport.start,
        end: netIncomeReport.end,
        val: netIncomeReport.val! / assetReport.val!,
        fp: netIncomeReport.fp,
        fy: netIncomeReport.fy,
      } as ReportPretty
    },
  },
  ReturnOnEquity: {
    tags: ['NetIncomeLoss', 'Equity'] as const,
    callback: (netIncomeReport: ReportPretty, equityReport: ReportPretty) => {
      if (!netIncomeReport || !equityReport) return undefined
      return {
        start: netIncomeReport.start,
        end: netIncomeReport.end,
        val: netIncomeReport.val! / equityReport.val!,
        fp: netIncomeReport.fp,
        fy: netIncomeReport.fy,
      } as ReportPretty
    },
  },
  ReturnOnOperations: {
    tags: ['NetCashFlowsOperating', 'Equity'] as const,
    callback: (operationReport: ReportPretty, equityReport: ReportPretty) => {
      if (!operationReport || !equityReport) return undefined
      return {
        start: operationReport.start,
        end: operationReport.end,
        val: operationReport.val! / equityReport.val!,
        fp: operationReport.fp,
        fy: operationReport.fy,
      } as ReportPretty
    },
  },
  ReturnOnSales: {
    tags: ['NetIncomeLoss', 'Revenues'] as const,
    callback: (netIncomeReport: ReportPretty, revenueReport: ReportPretty) => {
      if (!netIncomeReport || !revenueReport) return undefined
      return {
        start: netIncomeReport.start,
        end: netIncomeReport.end,
        val: netIncomeReport.val! / revenueReport.val!,
        fp: netIncomeReport.fp,
        fy: netIncomeReport.fy,
      } as ReportPretty
    },
  },
} as const

const weights = {
  //
  NetCashProvidedByUsedInOperatingActivities: 19,
  // Revenue
  Revenues: 2,
  // RevenueFromContractWithCustomerExcludingAssessedTax: 2,
  // RevenueFromContractWithCustomerIncludingAssessedTax: 2,
  // (Net Income)
  // ProfitLoss: 8,
  // NetIncomeLoss: 8,
  // //
  // StockholdersEquity: 5,
  // CashAndCashEquivalentsAtCarryingValue: 2,
  // Cash: 2,
  // PaymentsToAcquireProductiveAssets: -10,
  // PaymentsToAcquirePropertyPlantAndEquipment: -8,
  // PaymentsToAcquireBusinessesNetOfCashAcquired: -3,
  // NetCashProvidedByUsedInInvestingActivities: -7,
  // NetCashProvidedByUsedInFinancingActivities: -5,
  // InventoryNet: -12,
  // // Income tax payable
  // IncreaseDecreaseInIncomeTaxesPayableNetOfIncomeTaxesReceivable: -9,
  // // Deferred Income tax
  // DeferredIncomeTaxExpenseBenefit: -6,
  // // Share based compensation
  // ShareBasedCompensation: -3,
  // // Impairment of Long-Lived Assets to be Disposed of
  // ImpairmentOfLongLivedAssetsToBeDisposedOf: 4,
  // AssetsCurrent: 3,
  // Liabilities: -1,
  // LiabilitiesCurrent: 0,
  //PaymentsOfDividendsCommonStock: 2,
  //Assets: 3,
}

// financial health score
// assets / equity ratio
// assets / liability ratio
// income growth
// NetCashProvidedByUsedInOperatingActivities growth & positive to equity
// Rev growth & positive relative to equity

//
export type Weights = typeof weights

export const config = {
  useCache: true,
  filePath: './processor/cache',
  earningsChunkSize: 11,
  waitTime: 1000,
  date: '2022-05-12',
  weights,
  quaters: 1,
  currencies: ['USD'],
}
