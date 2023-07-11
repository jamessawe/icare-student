import { DefineAdditionalDataFieldsComponent } from "./define-additional-data-fields/define-additional-data-fields.component";
import { ManageAdditionalDataFieldsComponent } from "./manage-additional-data-fields/manage-additional-data-fields.component";
import { MultipleResultsEntryComponent } from "./multiple-results-entry/multiple-results-entry.component";
import { SampleImportExportComponent } from "./sample-import-export/sample-import-export.component";
import { SampleTemplateTableComponent } from "./sample-template-table/sample-template-table.component";
import { SamplesToCollectComponent } from "./samples-to-collect/samples-to-collect.component";
import { SamplesToExportComponent } from "./samples-to-export/samples-to-export.component";
import { SharedAssociatedFieldResultsEntryComponent } from "./shared-associated-field-results-entry/shared-associated-field-results-entry.component";
import { SharedPrintResultsDashboardComponent } from "./shared-print-results-dashboard/shared-print-results-dashboard.component";
import { SharedSamplesSummaryDashboardComponent } from "./shared-samples-summary-dashboard/shared-samples-summary-dashboard.component";

export const labSharedComponents: any[] = [
  SharedSamplesSummaryDashboardComponent,
  ManageAdditionalDataFieldsComponent,
  DefineAdditionalDataFieldsComponent,
  SharedAssociatedFieldResultsEntryComponent,
  SamplesToCollectComponent,
  MultipleResultsEntryComponent,
  SampleImportExportComponent,
  SamplesToExportComponent,
  SampleTemplateTableComponent,
  SharedPrintResultsDashboardComponent,
];
