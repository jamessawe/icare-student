import { Component, Input, OnInit, Provider } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { select, Store } from "@ngrx/store";
import { map } from "lodash";
import { Observable } from "rxjs";
import { CreatePatientBedOrderModalComponent } from "src/app/shared/components/create-patient-bed-order-modal/create-patient-bed-order-modal.component";
import { DischargePatientModalComponent } from "src/app/shared/components/discharge-patient-modal/discharge-patient-modal.component";
import { TransferPatientOutsideComponent } from "src/app/shared/components/transfer-patient-outside/transfer-patient-outside.component";
import { TransferWithinComponent } from "src/app/shared/components/transfer-within/transfer-within.component";
import { getApplicableForms } from "src/app/shared/helpers/identify-applicable-forms.helper";
import { ICARE_CONFIG } from "src/app/shared/resources/config";
import { Patient } from "src/app/shared/resources/patient/models/patient.model";
import { Visit } from "src/app/shared/resources/visits/models/visit.model";
import { loadCustomOpenMRSForms } from "src/app/store/actions";
import { clearBills } from "src/app/store/actions/bill.actions";
import { saveObservationsUsingEncounter } from "src/app/store/actions/observation.actions";
import { AppState } from "src/app/store/reducers";
import { getCustomOpenMRSFormsByIds } from "src/app/store/selectors/form.selectors";
import {
  getGroupedObservationByConcept,
  getSavingObservationStatus,
} from "src/app/store/selectors/observation.selectors";
import {
  addBillStatusOnBedOrders,
  getCountOfUnPaidBedOrders,
} from "../../helpers/sanitize-bed-orders.helper";
import { AssignBedToPatientComponent } from "../assign-bed-to-patient/assign-bed-to-patient.component";

@Component({
  selector: "app-inpatient",
  templateUrl: "./inpatient.component.html",
  styleUrls: ["./inpatient.component.scss"],
})
export class InpatientComponent implements OnInit {
  @Input() activeVisit: Visit;
  @Input() bedsByLocationDetails: any;
  @Input() currentPatient: Patient;
  @Input() provider: Provider;
  @Input() patientBillingDetails: any;
  @Input() formPrivilegesConfigs: any[];
  @Input() currentUser: any;
  @Input() userPrivileges: any;
  savingObservations$: Observable<boolean>;
  bedOrdersWithBillStatus: any[];
  countOfUnPaidBedOrders: number;
  now: Date = new Date();
  currentBedOrder: any;
  applicableForms: any[];
  forms$: Observable<any[]>;
  observations$: Observable<any>;

  selectedTab = new FormControl(0);
  lastBedOrder: any;
  observationsGroupedByConcept$: Observable<any>;

  constructor(private store: Store<AppState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    const bedOrders =
      this.activeVisit &&
      this.activeVisit.otherOrders &&
      this.activeVisit.otherOrders?.length > 0
        ? this.activeVisit.otherOrders.filter(
            (otherOrder) =>
              otherOrder?.order?.orderType?.name.toLowerCase() === "bed order"
          ) || []
        : [];
    this.bedOrdersWithBillStatus = addBillStatusOnBedOrders(
      bedOrders,
      this.patientBillingDetails?.bills,
      this.activeVisit
    );

    this.currentBedOrder = this.bedOrdersWithBillStatus[0];
    this.lastBedOrder = this.bedOrdersWithBillStatus[0];

    this.countOfUnPaidBedOrders = getCountOfUnPaidBedOrders(
      this.bedOrdersWithBillStatus
    );

    this.applicableForms = getApplicableForms(
      ICARE_CONFIG,
      this.currentUser,
      this.formPrivilegesConfigs,
      this.userPrivileges
    );

    const locationFormsAttributes =
      this.bedsByLocationDetails.attributes.filter(
        (attribute) =>
          attribute?.attributeType?.display.toLowerCase() === "forms"
      ) || [];
    const formsAssignedToCurrentLocation =
      locationFormsAttributes?.length > 0
        ? locationFormsAttributes.map((attribute) => attribute?.value)
        : [];
    const formUuids = map(this.applicableForms, (form) => {
      return form?.id;
    }).filter(
      (formId) =>
        formsAssignedToCurrentLocation?.length > 0 &&
        (
          formsAssignedToCurrentLocation.filter(
            (assignedFormId) => assignedFormId === formId
          ) || []
        )?.length > 0
    );
    this.store.dispatch(
      loadCustomOpenMRSForms({
        formUuids: formUuids,
      })
    );

    this.forms$ = this.store.select(getCustomOpenMRSFormsByIds, {
      formUUids: map(this.applicableForms, (form) => {
        return form?.id;
      }),
    });

    this.observations$ = this.store.select(getGroupedObservationByConcept);
    this.savingObservations$ = this.store.pipe(
      select(getSavingObservationStatus)
    );

    this.observationsGroupedByConcept$ = this.store.select(
      getGroupedObservationByConcept
    );
  }

  onAdmit(e, location, patient, provider, visit, bedOrdersWithBillStatus) {
    e.stopPropagation();
    this.dialog.open(AssignBedToPatientComponent, {
      width: "70%",
      maxHeight: "570px",
      data: {
        location,
        patient,
        provider,
        visit,
        bedOrdersWithBillStatus,
      },
      disableClose: true,
      panelClass: "custom-dialog-container",
    });
  }

  clearBills(event: Event) {
    event.stopPropagation();
    this.store.dispatch(clearBills());
  }

  changeTab(index) {
    this.selectedTab.setValue(index);
  }

  onSaveObservations(data: any, patient): void {
    this.store.dispatch(
      saveObservationsUsingEncounter({
        data,
        patientId: patient?.patient?.uuid,
      })
    );
  }

  setCurrentBedOrder(event: Event, bedOrder) {
    event.stopPropagation();
    this.currentBedOrder = null;
    setTimeout(() => {
      this.currentBedOrder = bedOrder;
    }, 100);
  }

  transferPatient(event: Event, visit): void {
    event.stopPropagation();
    this.dialog.open(TransferWithinComponent, {
      height: "250px",
      width: "40%",
      data: {
        patient: this.currentPatient,
        form: { form: { formUuid: null } },
        visit,
        locationType: "Bed Location",
        path: "/inpatient",
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }

  transferPatientOutSide(event: Event, visit): void {
    event.stopPropagation();
    this.dialog.open(TransferPatientOutsideComponent, {
      minHeight: "250px",
      width: "70%",
      data: {
        patient: this.currentPatient,
        form: {
          formUuid: "iCARE703-FORM-4df6-a364-abc9b1f48193",
          locationType: "Refer-to Location",
        },
        visit,
        path: "/inpatient/dashboard/" + this.currentPatient["patient"]["uuid"],
        params: { patient: this.currentPatient["patient"]["uuid"] },
      },
      disableClose: false,
      panelClass: "custom-dialog-container",
    });
  }

  dischargePatient(
    event: Event,
    visit,
    currentPatient,
    provider,
    lastBedOrder
  ) {
    event.stopPropagation();
    this.dialog.open(DischargePatientModalComponent, {
      width: "30%",
      data: {
        ...visit,
        provider,
        patient: currentPatient?.patient,
        lastBedOrder,
      },
    });
  }

  createNewOrder(event: Event, visit, currentPatient, provider, lastBedOrder) {
    event.stopPropagation();
    this.dialog
      .open(CreatePatientBedOrderModalComponent, {
        width: "30%",
        data: {
          ...visit,
          provider,
          patient: currentPatient?.patient,
          lastBedOrder,
        },
      })
      .afterClosed()
      .subscribe(() => {
        window.location.reload();
      });
  }
}
