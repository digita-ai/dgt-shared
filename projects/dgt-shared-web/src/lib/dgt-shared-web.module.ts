import { NgModule } from '@angular/core';
import { DGTTitleService } from './interface/services/dgt-title.service';
import { DGTPhoneValidator } from './validation/validators/dgt-phone.validator';
import { DGTCompareValidator } from './validation/validators/dgt-compare.validator';
import { DGTI8NService } from './i8n/services/dgt-i8n.service';
import { DGTSharedUtilsModule } from '@digita/dgt-shared-utils';
import { DGTNGRXStoreService } from './state/services/dgt-ngrx-store.service';
import { DGTStoreService } from './state/services/dgt-store.service';
import { DGTSharedDataModule } from '@digita/dgt-shared-data';
import { MatPaginatorModule, MatTableModule, MatSortModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { DGTButtonComponent } from './interface/components/dgt-button/dgt-button.component';
import { DGTButtonConfirmComponent } from './interface/components/dgt-button-confirm/dgt-button-confirm.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { DGTActivitiesComponent } from './lineage/components/dgt-activities/dgt-activities.component';
import { DGTFormValidationComponent } from './form/components/dgt-form-validation/dgt-form-validation.component';
import { DGTFormControlComponent } from './form/components/dgt-form-control/dgt-form-control.component';
import { DGTFormDateComponent } from './form/components/dgt-form-date/dgt-form-date.component';
import { DGTFormElementComponent } from './form/components/dgt-form-element/dgt-form-element.component';
import { DGTFormComponent } from './form/components/dgt-form/dgt-form.component';
import { DGTFormFileComponent } from './form/components/dgt-form-file/dgt-form-file.component';
import { DGTFormLabelComponent } from './form/components/dgt-form-label/dgt-form-label.component';
import { DGTFormAfterValidator } from './form/validators/dgt-form-after.validator';
import { DGTFormBeforeValidator } from './form/validators/dgt-form-before.validator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DGTChipComponent } from './interface/components/dgt-chip/dgt-chip.component';
import { DGTLoadingPageComponent } from './interface/components/dgt-loading-page/dgt-loading-page.component';
import { DGTStandardPageComponent } from './interface/components/dgt-standard-page/dgt-standard-page.component';
import { DGTBrowserIsSupportedGuard } from './interface/guards/dgt-browser-is-supported.guard';
import { DGTNotificationsComponent } from './interface/components/dgt-notifications/dgt-notifications.component';
import { DGTSectionComponent } from './interface/components/dgt-section/dgt-section.component';
import { DGTSectionTitleComponent } from './interface/components/dgt-section-title/dgt-section-title.component';
import { DGTSectionContentComponent } from './interface/components/dgt-section-content/dgt-section-content.component';
import { DGTSplitPageComponent } from './interface/components/dgt-split-page/dgt-split-page.component';
import { DGTSplitPageContentComponent } from './interface/components/dgt-split-page-content/dgt-split-page-content.component';
import { DGTSplitPageSidenavComponent } from './interface/components/dgt-split-page-sidenav/dgt-split-page-sidenav.component';
import { DGTSplitPageHeaderComponent } from './interface/components/dgt-split-page-header/dgt-split-page-header.component';
import { DGTSplitPageSubHeaderComponent } from './interface/components/dgt-split-page-sub-header/dgt-split-page-sub-header.component';
import { DGTSectionHelpComponent } from './interface/components/dgt-section-help/dgt-section-help.component';
import { DGTSectionSummaryComponent } from './interface/components/dgt-section-summary/dgt-section-summary.component';
import { DGTSectionResetComponent } from './interface/components/dgt-section-reset/dgt-section-reset.component';
import { DGTDialogComponent } from './interface/components/dgt-dialog/dgt-dialog.component';
import { DGTDialogActionComponent } from './interface/components/dgt-dialog-action/dgt-dialog-action.component';
import { DGTDialogContentComponent } from './interface/components/dgt-dialog-content/dgt-dialog-content.component';
import { DGTLinkComponent } from './interface/components/dgt-link/dgt-link.component';
import { DGTSectionHelpTitleComponent } from './interface/components/dgt-section-help-title/dgt-section-help-title.component';
import { DGTNotificationComponent } from './interface/components/dgt-notification/dgt-notification.component';
import { DGTSplitPageHeaderProfileComponent } from './interface/components/dgt-split-page-header-profile/dgt-split-page-header-profile.component';
import { RouterModule } from '@angular/router';
import { DGTSplitPageRailComponent } from './interface/components/dgt-split-page-rail/dgt-split-page-rail.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const declarations = [
  DGTButtonComponent,
  DGTButtonConfirmComponent,
  DGTFormValidationComponent,
  DGTFormControlComponent,
  DGTFormDateComponent,
  DGTFormElementComponent,
  DGTFormComponent,
  DGTFormFileComponent,
  DGTFormLabelComponent,
  DGTActivitiesComponent,
  DGTChipComponent,
  DGTLoadingPageComponent,
  DGTStandardPageComponent,
  DGTDialogComponent,
  DGTDialogActionComponent,
  DGTDialogContentComponent,
  DGTLinkComponent,
  DGTSectionComponent,
  DGTSectionHelpComponent,
  DGTSectionHelpTitleComponent,
  DGTSectionResetComponent,
  DGTSectionSummaryComponent,
  DGTSectionTitleComponent,
  DGTSectionContentComponent,
  DGTSplitPageComponent,
  DGTSplitPageHeaderComponent,
  DGTSplitPageSidenavComponent,
  DGTSplitPageSubHeaderComponent,
  DGTSplitPageRailComponent,
  DGTSplitPageContentComponent,
  DGTNotificationComponent,
  DGTNotificationsComponent,
  DGTSplitPageHeaderProfileComponent,
];
export const imports = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  FlexLayoutModule,
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    }
  }),
  MatButtonModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  DGTSharedUtilsModule,
  DGTSharedDataModule,
];
export const providers = [
  DGTTitleService,
  DGTI8NService,
  DGTPhoneValidator,
  DGTCompareValidator,
  {
    provide: DGTStoreService,
    useClass: DGTNGRXStoreService
  },
  DGTFormAfterValidator,
  DGTFormBeforeValidator,
  DGTBrowserIsSupportedGuard
];

@NgModule({
  declarations,
  providers,
  imports,
  exports: [
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DGTButtonComponent,
    DGTButtonConfirmComponent,
    DGTFormValidationComponent,
    DGTFormControlComponent,
    DGTFormDateComponent,
    DGTFormElementComponent,
    DGTFormComponent,
    DGTFormFileComponent,
    DGTFormLabelComponent,
    DGTActivitiesComponent,
    DGTChipComponent,
    DGTLoadingPageComponent,
    DGTStandardPageComponent,
    DGTDialogComponent,
    DGTDialogActionComponent,
    DGTDialogContentComponent,
    DGTLinkComponent,
    DGTSectionComponent,
    DGTSectionHelpComponent,
    DGTSectionHelpTitleComponent,
    DGTSectionResetComponent,
    DGTSectionSummaryComponent,
    DGTSectionTitleComponent,
    DGTSectionContentComponent,
    DGTSplitPageComponent,
    DGTSplitPageHeaderComponent,
    DGTSplitPageSidenavComponent,
    DGTSplitPageSubHeaderComponent,
    DGTSplitPageRailComponent,
    DGTSplitPageContentComponent,
    DGTNotificationComponent,
    DGTNotificationsComponent,
    DGTSplitPageHeaderProfileComponent,
  ]
})
export class DGTSharedWebModule { }
