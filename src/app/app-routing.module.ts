import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then( m => m.TermsPageModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('./logout/logout.module').then( m => m.LogoutPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'pickup',
    loadChildren: () => import('./pickup/pickup.module').then( m => m.PickupPageModule)
  },
  {
    path: 'pickup-detail/:job_id',
    loadChildren: () => import('./pickup-detail/pickup-detail.module').then( m => m.PickupDetailPageModule)
  },
  {
    path: 'pickup-detail-task/:task_id',
    loadChildren: () => import('./pickup-detail-task/pickup-detail-task.module').then( m => m.PickupDetailTaskModule)
  },
  {
    path: 'delivery-detail-task/:task_id',
    loadChildren: () => import('./delivery-detail-task/delivery-detail-task.module').then( m => m.DeliveryDetailTaskModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('./delivery/delivery.module').then( m => m.DeliveryPageModule)
  },
  {
    path: 'delivery-detail/:job_id',
    loadChildren: () => import('./delivery-detail/delivery-detail.module').then( m => m.DeliveryDetailPageModule)
  },
  {
    path: 'commission-report',
    loadChildren: () => import('./commission-report/commission-report.module').then( m => m.CommissionReportPageModule)
  },
  {
    path: 'scan',
    loadChildren: () => import('./scan/scan.module').then( m => m.ScanPageModule)
  },
  {
    path: 'result/:cn_no',
    loadChildren: () => import('./result/result.module').then( m => m.ResultPageModule)
  },
  {
    path: 'result-detail/:sales_order_id',
    loadChildren: () => import('./result-detail/result-detail.module').then( m => m.ResultDetailPageModule)
  },
  {
    path: 'pickup-order',
    loadChildren: () => import('./pickup-order/pickup-order.module').then( m => m.PickupOrderPageModule)
  },
  {
    path: 'delivery-order',
    loadChildren: () => import('./delivery-order/delivery-order.module').then( m => m.DeliveryOrderPageModule)
  },
  {
    path: 'collection',
    loadChildren: () => import('./collection/collection.module').then( m => m.CollectionPageModule)
  },
  {
    path: 'collection-detail/:purchase_order_id',
    loadChildren: () => import('./collection-detail/collection-detail.module').then( m => m.CollectionDetailPageModule)
  },
  {
    path: 'grn/:purchase_order_id',
    loadChildren: () => import('./grn/grn.module').then( m => m.GrnPageModule)
  },
  {
    path: 'grn-by-task/:task_id',
    loadChildren: () => import('./grn-by-task/grn-by-task.module').then( m => m.GrnByTaskModule)
  },
  {
    path: 'modal-signature',
    loadChildren: () => import('./modal-signature/modal-signature.module').then( m => m.ModalSignaturePageModule)
  },
  {
    path: 'qc-detail/:goods_received_note_id',
    loadChildren: () => import('./qc-detail/qc-detail.module').then( m => m.QcDetailPageModule)
  },
  {
    path: 'qc/:purchase_order_id',
    loadChildren: () => import('./qc/qc.module').then( m => m.QcPageModule)
  },
  {
    path: 'collection-order',
    loadChildren: () => import('./collection-order/collection-order.module').then( m => m.CollectionOrderPageModule)
  },
  {
    path: 'punch-card',
    loadChildren: () => import('./punch-card/punch-card.module').then( m => m.PunchCardPageModule)
  },
  {
    path: 'punching',
    loadChildren: () => import('./punching/punching.module').then( m => m.PunchingPageModule)
  },
  {
    path: 'modal-punching',
    loadChildren: () => import('./modal-punching/modal-punching.module').then( m => m.ModalPunchingPageModule)
  },
  {
    path: 'job-log-history/:sales_order_id',
    loadChildren: () => import('./job-log-history/job-log-history.module').then( m => m.JobLogHistoryPageModule)
  },
  {
    path: 'bullion-pending-reweight',
    loadChildren: () => import('./bullion-pending-reweight/bullion-pending-reweight.module').then( m => m.BullionPendingReweightPageModule)
  },
  {
    path: 'bullion-pending-reweight-detail/:goods_received_note_id',
    loadChildren: () => import('./bullion-pending-reweight-detail/bullion-pending-reweight-detail.module').then( m => m.BullionPendingReweightDetailPageModule)
  },
  {
    path: 'bullion-pending-check',
    loadChildren: () => import('./bullion-pending-check/bullion-pending-check.module').then( m => m.BullionPendingCheckPageModule)
  },
  {
    path: 'bullion-pending-check-detail/:goods_received_note_id',
    loadChildren: () => import('./bullion-pending-check-detail/bullion-pending-check-detail.module').then( m => m.BullionPendingCheckDetailPageModule)
  },
  {
    path: 'bullion-pending-tbc',
    loadChildren: () => import('./bullion-pending-tbc/bullion-pending-tbc.module').then( m => m.BullionPendingTBCPageModule)
  },
  {
    path: 'bullion-pending-tbc-detail/:goods_received_note_id',
    loadChildren: () => import('./bullion-pending-tbc-detail/bullion-pending-tbc-detail.module').then( m => m.BullionPendingTbcDetailPageModule)
  },
  {
    path: 'bullion-change-request/:goods_received_note_detail_id',
    loadChildren: () => import('./bullion-change-request/bullion-change-request.module').then( m => m.BullionChangeRequestPageModule)
  },
  {
    path: 'bullion-add-change-request/:goods_received_note_detail_id/:mode',
    loadChildren: () => import('./bullion-add-change-request/bullion-add-change-request.module').then( m => m.BullionAddChangeRequestPageModule)
  },
  {
    path: 'task',
    loadChildren: () => import('./task/task.module').then( m => m.TaskPageModule)
  },
  {
    path: 'task-detail/:task_id',
    loadChildren: () => import('./task-detail/task-detail.module').then( m => m.TaskDetailPageModule)
  },
  {
    path: 'job-log',
    loadChildren: () => import('./job-log/job-log.module').then( m => m.JobLogPageModule)
  },
  {
    path: 'pending-order/:type',
    loadChildren: () => import('./pending-order/pending-order.module').then( m => m.PendingOrderPageModule)
  },
  {
    path: 'collection-supplier',
    loadChildren: () => import('./collection-supplier/collection-supplier.module').then( m => m.CollectionSupplierPageModule)
  },
  {
    path: 'collection-supplier/:type',
    loadChildren: () => import('./collection-supplier/collection-supplier.module').then( m => m.CollectionSupplierPageModule)
  },
  {
    path: 'modal-grn',
    loadChildren: () => import('./modal-grn/modal-grn.module').then( m => m.ModalGrnPageModule)
  },
  {
    path: 'modal-pending-reweight',
    loadChildren: () => import('./modal-pending-reweight/modal-pending-reweight.module').then( m => m.ModalPendingReweightPageModule)
  },
  {
    path: 'modal-task',
    loadChildren: () => import('./modal-task/modal-task.module').then( m => m.ModalTaskPageModule)
  },
  {
    path: 'modal-qc',
    loadChildren: () => import('./modal-qc/modal-qc.module').then( m => m.ModalQcPageModule)
  },
  {
    path: 'modal-add-change-request',
    loadChildren: () => import('./modal-add-change-request/modal-add-change-request.module').then( m => m.ModalAddChangeRequestPageModule)
  },
  {
    path: 'inbox/:inbox_type',
    loadChildren: () => import('./inbox/inbox.module').then( m => m.InboxPageModule)
  },
  {
    path: 'make-po/:customer_id',
    loadChildren: () => import('./make-po/make-po.module').then( m => m.MakePoPageModule)
  },
  {
    path: 'make-po-customer',
    loadChildren: () => import('./make-po-customer/make-po-customer.module').then( m => m.MakePoCustomerPageModule)
  },
  {

    path: 'batch-scan',
    loadChildren: () => import('./batch-scan/batch-scan.module').then( m => m.BatchScanPageModule)
  },
  {
    path: 'weight',
    loadChildren: () => import('./weight/weight.module').then( m => m.WeightPageModule)
  },
  {
    path: 'weight-detail/:goods_received_note_id',
    loadChildren: () => import('./weight-detail/weight-detail.module').then( m => m.WeightDetailPageModule)
  },
  {
    path: 'test',
    loadChildren: () => import('./test/test.module').then( m => m.TestPageModule)
  },
  {
    path: 'test-detail/:goods_received_note_id',
    loadChildren: () => import('./test-detail/test-detail.module').then( m => m.TestDetailPageModule)
  },
  {
    path: 'modal-test',
    loadChildren: () => import('./modal-test/modal-test.module').then( m => m.ModalTestPageModule)
  },
  {
    path: 'pending-order',
    loadChildren: () => import('./pending-order/pending-order.module').then( m => m.PendingOrderPageModule)
  },
  {
    path: 'modal-pending-order',
    loadChildren: () => import('./modal-pending-order/modal-pending-order.module').then( m => m.ModalPendingOrderPageModule)
  },
  {
    path: 'request-order/:type',
    loadChildren: () => import('./request-order/request-order.module').then( m => m.RequestOrderPageModule)
  },
  {
    path: 'redeem-task',
    loadChildren: () => import('./redeem-task/redeem-task.module').then( m => m.RedeemTaskPageModule)
  },
  {
    path: 'modal-task-detail',
    loadChildren: () => import('./modal-task-detail/modal-task-detail.module').then( m => m.ModalTaskDetailPageModule)
  },
  {
    path: 'modal-claim-cart',
    loadChildren: () => import('./modal-claim-cart/modal-claim-cart.module').then( m => m.ModalClaimCartPageModule)
  },
  {
    path: 'personal-dashboard',
    loadChildren: () => import('./personal-dashboard/personal-dashboard.module').then( m => m.PersonalDashboardModule)
  },
  {
    path: 'gold-shipment-clock-in-list',
    loadChildren: () => import('./gold-shipment-clock-in-list/gold-shipment-clock-in-list.module')
      .then( m => m.GoldShipmentClockInListPageModule)
  },
  {
    path: 'gold-shipment-clock-in/:gold_shipment_clock_in_id',
    loadChildren: () => import('./gold-shipment-clock-in/gold-shipment-clock-in.module').then( m => m.GoldShipmentClockInModule)
  },
  {
    path: 'gold-shipment-clock-in',
    loadChildren: () => import('./gold-shipment-clock-in/gold-shipment-clock-in.module').then( m => m.GoldShipmentClockInModule)
  },
  {
    path: 'gold-shipment-list',
    loadChildren: () => import('./gold-shipment-list/gold-shipment-list.module')
      .then( m => m.GoldShipmentListPageModule)
  },
  {
    path: 'gold-shipment/:gold_shipment_id',
    loadChildren: () => import('./gold-shipment/gold-shipment.module').then( m => m.GoldShipmentModule)
  },
  {
    path: 'gold-shipment',
    loadChildren: () => import('./gold-shipment/gold-shipment.module').then( m => m.GoldShipmentModule)
  },
  {
    path: 'assay-report-clock-in-list',
    loadChildren: () => import('./assay-report-clock-in-list/assay-report-clock-in-list.module')
      .then( m => m.AssayReportClockInListPageModule)
  },
  {
    path: 'assay-report-clock-in/:assay_report_purity_id',
    loadChildren: () => import('./assay-report-clock-in/assay-report-clock-in.module').then( m => m.AssayReportClockInPageModule)
  },
  {
    path: 'assay-report-clock-in',
    loadChildren: () => import('./assay-report-clock-in/assay-report-clock-in.module').then( m => m.AssayReportClockInPageModule)
  },
  {
    path: 'exchange-note-list',
    loadChildren: () => import('./exchange-note-list/exchange-note-list.module')
      .then( m => m.ExchangeNoteListPageModule)
  },
  {
    path: 'exchange-note/:exchange_note_id',
    loadChildren: () => import('./exchange-note/exchange-note.module').then( m => m.ExchangeNotePageModule)
  },
  {
    path: 'melting-job-list',
    loadChildren: () => import('./melting-job-list/melting-job-list.module')
      .then( m => m.MeltingJobListPageModule)
  },
  {
    path: 'melting-job/:melting_job_order_id',
    loadChildren: () => import('./melting-job/melting-job.module').then( m => m.MeltingJobPageModule)
  },
  {
    path: 'melting-job-wizard-list',
    loadChildren: () => import('./melting-job-wizard-list/melting-job-wizard-list.module')
      .then( m => m.MeltingJobWizardListPageModule)
  },
  {
    path: 'melting-job-wizard/:melting_job_order_id',
    loadChildren: () => import('./melting-job-wizard/melting-job-wizard.module').then( m => m.MeltingJobWizardPageModule)
  },
  {
    path: 'modal-task-action',
    loadChildren: () => import('./modal-task-action/modal-task-action.module').then( m => m.ModalTaskActionPageModule)
  },
  {
    path: 'modal-task-action-scheduled',
    loadChildren: () => import('./modal-task-action-scheduled/modal-task-action-scheduled.module')
      .then( m => m.ModalTaskActionScheduledPageModule)
  },
  {
    path: 'modal-task-action-add-collaborator',
    loadChildren: () => import('./modal-task-action-add-collaborator/modal-task-action-add-collaborator.module')
      .then( m => m.ModalTaskActionAddCollaboratorModule)
  },
  {
    path: 'customer-list',
    loadChildren: () => import('./customer-list/customer-list.module').then( m => m.CustomerListPageModule)
  },
  {
    path: 'modal-customer-list',
    loadChildren: () => import('./modal-customer-list/modal-customer-list.module').then( m => m.ModalCustomerListPageModule)
  },
  {
    path: 'redeem-cdo',
    loadChildren: () => import('./redeem-cdo/redeem-cdo.module').then( m => m.RedeemCdoPageModule)
  },
  {
    path: 'cdo-tasks',
    loadChildren: () => import('./cdo-tasks/cdo-tasks.module').then( m => m.CdoTasksPageModule)
  },


























  // {
  //   path: 'tab1',
  //   loadChildren: () => import('./tab1/tab1.module').then( m => m.Tab1PageModule)
  // },
  // {
  //   path: 'tab2',
  //   loadChildren: () => import('./tab2/tab2.module').then( m => m.Tab2PageModule)
  // }




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
