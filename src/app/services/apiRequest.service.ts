import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ServerValidation, SubmitResponse } from './Model/server-validation.model';
import { SubmitRequest, UploadRequest, UploadDocumentsPayload } from './Model/formSubmit.model';
import { environment } from '../../environments/environment';
import { AlertService } from '../services/alertMessage.service';

type PolitaPayload = Pick<SubmitRequest, 'policyNo'>;
type IdentityPayload = Pick<SubmitRequest, 'policyNo' | 'securityNumber'>;
type FinalPayload = Pick<SubmitRequest, 'policyNo' | 'securityNumber' | 'chassisNumber'>;

@Injectable({ providedIn: 'root' })
export class ApiRequest {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  apiUrl: string = environment.apiUrl;

  private readonly MOCK = false;

  private simulate<T>(data: T, ms = 400): Observable<T> {
    return of(data).pipe(delay(ms));
  }

  // helper pt. a map-a erorile HTTP la noul model
  private mapHttpError(err: any, attribute: string = ''): ServerValidation {
    const msg = err?.error?.message || err?.message || 'Eroare server';
    return {
      isValid: false,
      messages: [{ error: true, attribute, information: msg }]
    };
  }

  validatePolita(policyNo: string): Observable<ServerValidation> {
    if (this.MOCK) {
      return this.simulate<ServerValidation>({
        isValid: true,
        messages: [{ error: false, attribute: 'policyNo', information: `Polița ${policyNo} este validă (simulat).` }]
      });
    }

    const payload: PolitaPayload = { policyNo };

    return this.http
      .post<ServerValidation>(`${this.apiUrl}/refound/validaterefound`, payload)
      .pipe(
        tap({
          next: (res) => {
            console.log('[ApiRequest.validatePolita] response:', res);
          },
          error: (err) => {
            console.error('[ApiRequest.validatePolita] error:', err);
          },
        })
      );
  }

  validateWithIdentity(payload: IdentityPayload): Observable<ServerValidation> {
    if (this.MOCK) {
      return this.simulate<ServerValidation>({
        isValid: true,
        messages: [{
          error: false,
          attribute: 'securityNumber',
          information: `Identitate validă pentru SN ${payload.securityNumber} și polița ${payload.policyNo} (simulat).`
        }]
      });
    }
    return this.http.post<ServerValidation>(`${this.apiUrl}/refound/validaterefound`, payload).pipe(
      tap({
        next: (res) => {
          console.log('[ApiRequest.validatePolita] response:', res);
        },
        error: (err) => {
          console.error('[ApiRequest.validatePolita] error:', err);
        },
      })
    );
  }

  validateWithIdentityAndCar(payload: FinalPayload): Observable<ServerValidation> {
    if (this.MOCK) {
      return this.simulate<ServerValidation>({
        isValid: true,
        messages: [{
          error: false,
          attribute: 'chassisNumber',
          information: `Verificare finală OK pentru polița ${payload.policyNo}, VIN ${payload.chassisNumber} (simulat).`
        }]
      });
    }
    return this.http.post<ServerValidation>(`${this.apiUrl}/refound/validaterefound`, payload);
  }

  submitCancelPolicy(payload: SubmitRequest): Observable<SubmitResponse> {
    // if (this.MOCK) {
    //   // Simulated mock response
    //   return this.simulate<SubmitResponse>({
    //     id: 'mock-id-12345',
    //     number: '0000001',
    //     messages: []
    //   });
    // }

    return this.http.post<SubmitResponse>(`${this.apiUrl}/refound/registerrefound`, payload).pipe(
      tap({
        next: (res) => {
          // Success message (only when id + number exist)
          if (res.id && res.number) {
            this.alertService.showAlert(
              'Formularul a fost trimis cu succes, continuați cu încărcarea documentelor.',
              'custom-alert-succes',
              true
            );
          }
          // Validation-only message
          else if (res.messages?.length) {
            const hasErrors = res.messages.some(m => m.error);
            if (hasErrors) {
              this.alertService.showAlert(
                'Formularul conține erori. Vă rugăm să corectați câmpurile marcate.',
                'custom-alert-error',
                true
              );
            }
          }
        },
        error: () => {
          this.alertService.showAlert(
            'Eroare la trimiterea formularului, vă rugăm să încercați din nou.',
            'custom-alert-error',
            true
          );
        },
      })
    );
  }

  // uploadDocumentBatch(payload: { refoundId: string; files: { name: string; contentType: string; base64String: string; category: string }[] }): Observable<ServerValidation> {
  //   // if (this.MOCK) {
  //   //   return this.simulate<ServerValidation>({
  //   //     isValid: true,
  //   //     messages: [{ error: false, attribute: 'documents', information: 'Fișierele au fost încărcate (simulat).' }]
  //   //   });
  //   // }
  //   return this.http.post<ServerValidation>(`${this.apiUrl}/refound/uploadrefoundfiles`, payload);
  // }

  uploadDocumentBatch(input: UploadDocumentsPayload): Observable<ServerValidation> {
    const body: any = {
      refoundId: input.refoundId,
      files: input.files.map(f => ({
        name: f.name,
        contentType: f.contentType,
        base64String: f.base64String,
        category: f.category,
      }))
    };

    if (input.observations && input.observations.trim()) {
      body.observations = input.observations.trim(); // observații la nivel de request
    }

    return this.http.post<ServerValidation>(`${this.apiUrl}/refound/uploadrefoundfiles`, body);
  }
}
