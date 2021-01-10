import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatBadgeModule,
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSortModule,
  MatTableModule,
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { DGTSharedDataModule } from '@digita-ai/dgt-shared-data';
import { DGTSharedUtilsModule } from '@digita-ai/dgt-shared-utils';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DGTDataCategoryComponent } from './data/components/dgt-data-category/dgt-data-category.component';
import { DGTDataFieldComponent } from './data/components/dgt-data-field/dgt-data-field.component';
import { DGTDataGroupComponent } from './data/components/dgt-data-group/dgt-data-group.component';
import { DGTDataInterfaceDescentComponent } from './data/components/dgt-data-interface-descent/dgt-data-interface-descent.component';
import { DGTDataInterfaceEmailValueComponent } from './data/components/dgt-data-interface-email-value/dgt-data-interface-email-value.component';
import { DGTDataInterfaceEmailComponent } from './data/components/dgt-data-interface-email/dgt-data-interface-email.component';
import { DGTDataInterfacePhoneValueComponent } from './data/components/dgt-data-interface-phone-value/dgt-data-interface-phone-value.component';
import { DGTDataInterfacePhoneComponent } from './data/components/dgt-data-interface-phone/dgt-data-interface-phone.component';
import { DGTDataInterfaceStandardComponent } from './data/components/dgt-data-interface-standard/dgt-data-interface-standard.component';
import { DGTDataInterfaceSurveysComponent } from './data/components/dgt-data-interface-surveys/dgt-data-interface-surveys.component';
import { DGTLDResourceComponent } from './data/components/dgt-data-value/dgt-data-value.component';
import { DGTDateToLabelService } from './date/services/dgt-date-to-label.service';
import { DGTFormControlComponent } from './form/components/dgt-form-control/dgt-form-control.component';
import { DGTFormDateComponent } from './form/components/dgt-form-date/dgt-form-date.component';
import { DGTFormElementComponent } from './form/components/dgt-form-element/dgt-form-element.component';
import { DGTFormFileComponent } from './form/components/dgt-form-file/dgt-form-file.component';
import { DGTFormLabelComponent } from './form/components/dgt-form-label/dgt-form-label.component';
import { DGTFormValidationComponent } from './form/components/dgt-form-validation/dgt-form-validation.component';
import { DGTFormComponent } from './form/components/dgt-form/dgt-form.component';
import { DGTFormAfterValidator } from './form/validators/dgt-form-after.validator';
import { DGTFormBeforeValidator } from './form/validators/dgt-form-before.validator';
import { DGTI8NService } from './i8n/services/dgt-i8n.service';
import { DGTButtonConfirmComponent } from './interface/components/dgt-button-confirm/dgt-button-confirm.component';
import { DGTButtonComponent } from './interface/components/dgt-button/dgt-button.component';
import { DGTCharmComponent } from './interface/components/dgt-charm/dgt-charm.component';
import { DGTChipComponent } from './interface/components/dgt-chip/dgt-chip.component';
import { DGTDialogActionComponent } from './interface/components/dgt-dialog-action/dgt-dialog-action.component';
import { DGTDialogContentComponent } from './interface/components/dgt-dialog-content/dgt-dialog-content.component';
import { DGTDialogComponent } from './interface/components/dgt-dialog/dgt-dialog.component';
import { DGTLinkComponent } from './interface/components/dgt-link/dgt-link.component';
import { DGTLoadingPageComponent } from './interface/components/dgt-loading-page/dgt-loading-page.component';
import { DGTMenuComponent } from './interface/components/dgt-menu/dgt-menu.component';
import { DGTNotificationComponent } from './interface/components/dgt-notification/dgt-notification.component';
import { DGTNotificationsComponent } from './interface/components/dgt-notifications/dgt-notifications.component';
import { DGTPageContentGroupHeaderComponent } from './interface/components/dgt-page-content-group-header/dgt-page-content-group-header.component';
import { DGTPageContentHeaderSubtitleComponent } from './interface/components/dgt-page-content-header-subtitle/dgt-page-content-header-subtitle.component';
import { DGTPageContentHeaderTitleComponent } from './interface/components/dgt-page-content-header-title/dgt-page-content-header-title.component';
import { DGTPageContentHeaderComponent } from './interface/components/dgt-page-content-header/dgt-page-content-header.component';
import { DGTPageContentComponent } from './interface/components/dgt-page-content/dgt-page-content.component';
import { DGTPageHeaderControlsComponent } from './interface/components/dgt-page-header-controls/dgt-page-header-controls.component';
import { DGTPageHeaderLogoComponent } from './interface/components/dgt-page-header-logo/dgt-page-header-logo.component';
import { DGTPageHeaderProfileComponent } from './interface/components/dgt-page-header-profile/dgt-page-header-profile.component';
import { DGTPageHeaderTitleComponent } from './interface/components/dgt-page-header-title/dgt-page-header-title.component';
import { DGTPageHeaderComponent } from './interface/components/dgt-page-header/dgt-page-header.component';
import { DGTPagePaneComponent } from './interface/components/dgt-page-pane/dgt-page-pane.component';
import { DGTPageRailItemComponent } from './interface/components/dgt-page-rail-item/dgt-page-rail-item.component';
import { DGTPageRailComponent } from './interface/components/dgt-page-rail/dgt-page-rail.component';
import { DGTPageSidenavComponent } from './interface/components/dgt-page-sidenav/dgt-page-sidenav.component';
import { DGTPageSubHeaderComponent } from './interface/components/dgt-page-sub-header/dgt-page-sub-header.component';
import { DGTPageComponent } from './interface/components/dgt-page/dgt-page.component';
import { DGTSectionActionComponent } from './interface/components/dgt-section-action/dgt-section-action.component';
import { DGTSectionAvatarComponent } from './interface/components/dgt-section-avatar/dgt-section-avatar.component';
import { DGTSectionContentComponent } from './interface/components/dgt-section-content/dgt-section-content.component';
import { DGTSectionHelpTitleComponent } from './interface/components/dgt-section-help-title/dgt-section-help-title.component';
import { DGTSectionHelpComponent } from './interface/components/dgt-section-help/dgt-section-help.component';
import { DGTSectionIconComponent } from './interface/components/dgt-section-icon/dgt-section-icon.component';
import { DGTSectionImageComponent } from './interface/components/dgt-section-image/dgt-section-image.component';
import { DGTSectionResetComponent } from './interface/components/dgt-section-reset/dgt-section-reset.component';
import { DGTSectionSubtitleComponent } from './interface/components/dgt-section-subtitle/dgt-section-subtitle.component';
import { DGTSectionSummaryComponent } from './interface/components/dgt-section-summary/dgt-section-summary.component';
import { DGTSectionTitleComponent } from './interface/components/dgt-section-title/dgt-section-title.component';
import { DGTSectionComponent } from './interface/components/dgt-section/dgt-section.component';
import { DGTBrowserIsSupportedGuard } from './interface/guards/dgt-browser-is-supported.guard';
import { DGTTimelineEventGroupComponent } from './timeline/components/timeline-event-group/timeline-event-group.component';
import { DGTTimelineEventSummaryComponent } from './timeline/components/timeline-event-summary/timeline-event-summary.component';
import { DGTTimelinePageComponent } from './timeline/components/timeline-page/timeline-page.component';
import { DGTCompareValidator } from './validation/validators/dgt-compare.validator';
import { DGTPhoneValidator } from './validation/validators/dgt-phone.validator';

// export const REDUCER_TOKEN = new InjectionToken<ActionReducerMap<any>>('Registered Reducers');

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const declarations = [
  DGTButtonComponent,
  DGTButtonConfirmComponent,
  DGTCharmComponent,
  DGTFormValidationComponent,
  DGTFormControlComponent,
  DGTFormDateComponent,
  DGTFormElementComponent,
  DGTFormComponent,
  DGTFormFileComponent,
  DGTFormLabelComponent,
  DGTChipComponent,
  DGTLoadingPageComponent,
  DGTDialogComponent,
  DGTDialogActionComponent,
  DGTDialogContentComponent,
  DGTLinkComponent,
  DGTSectionComponent,
  DGTSectionActionComponent,
  DGTSectionAvatarComponent,
  DGTSectionImageComponent,
  DGTSectionHelpComponent,
  DGTSectionHelpTitleComponent,
  DGTSectionIconComponent,
  DGTSectionResetComponent,
  DGTSectionSummaryComponent,
  DGTSectionSubtitleComponent,
  DGTSectionTitleComponent,
  DGTSectionContentComponent,
  DGTPageComponent,
  DGTPageSubHeaderComponent,
  DGTPageSidenavComponent,
  DGTPageSubHeaderComponent,
  DGTPagePaneComponent,
  DGTPageRailComponent,
  DGTPageRailItemComponent,
  DGTPageContentComponent,
  DGTNotificationComponent,
  DGTNotificationsComponent,
  DGTPageHeaderProfileComponent,
  DGTPageHeaderTitleComponent,
  DGTPageContentHeaderComponent,
  DGTPageHeaderComponent,
  DGTPageContentHeaderSubtitleComponent,
  DGTPageContentHeaderTitleComponent,
  DGTPageContentGroupHeaderComponent,
  DGTPageHeaderLogoComponent,
  DGTPageHeaderControlsComponent,
  DGTPageHeaderTitleComponent,
  DGTLDResourceComponent,
  DGTDataInterfaceSurveysComponent,
  DGTDataInterfaceStandardComponent,
  DGTDataInterfacePhoneValueComponent,
  DGTDataInterfacePhoneComponent,
  DGTDataInterfaceEmailValueComponent,
  DGTDataInterfaceEmailComponent,
  DGTDataFieldComponent,
  DGTDataInterfaceDescentComponent,
  DGTDataCategoryComponent,
  DGTDataGroupComponent,
  DGTMenuComponent,
  DGTTimelinePageComponent,
  DGTTimelineEventGroupComponent,
  DGTTimelineEventSummaryComponent,
];
export const imports: (any[] | Type<any> | ModuleWithProviders<{}>)[] = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  FlexLayoutModule,
  MatButtonModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatFormFieldModule,
  MatInputModule,
  MatPaginatorModule,
  MatSelectModule,
  DGTSharedUtilsModule,
  DGTSharedDataModule,
  MatMenuModule,
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  }),
  MatBadgeModule,
];
export const providers = [
  DGTI8NService,
  DGTPhoneValidator,
  DGTCompareValidator,
  DGTFormAfterValidator,
  DGTFormBeforeValidator,
  DGTBrowserIsSupportedGuard,
  DGTDateToLabelService,
];

@NgModule({
  declarations,
  providers,
  imports: [
    ...imports,
  ],
  exports: [...declarations],
})
export class DGTSharedWebModule { }
