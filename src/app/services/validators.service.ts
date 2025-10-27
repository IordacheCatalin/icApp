import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';



@Injectable({ providedIn: 'root' })
export class CustomValidatorsService {

  validateCNP(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cnp = (control.value ?? '').toString().trim();
      if (!cnp || cnp.length !== 13 || !/^\d+$/.test(cnp)) return { invalidLength: true };
      return this.isCNPValid(cnp) ? null : { invalidCNP: true };
    };
  }

  validatePhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const phone = (control.value ?? '').toString().trim();
      if (!phone) return { required: true };
      const numericOnly = /^\d+$/.test(phone);
      const startsWithZero = phone.startsWith('0');
      const lengthValid = phone.length >= 8 && phone.length <= 11;
      if (!numericOnly) return { invalidCharacters: true };
      if (!startsWithZero) return { mustStartWithZero: true };
      if (!lengthValid) return { invalidLength: true };
      return null;
    };
  }

  /** VIN: 17 caractere, fără I,O,Q */
  vin(): ValidatorFn {
    const re = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return (c: AbstractControl): ValidationErrors | null => {
      const v = (c.value || '').toString().trim();
      return !v ? null : (re.test(v) ? null : { vin: true });
    };
  }



  // --- IBAN universal (orice țară) ---
  private static readonly IBAN_LENGTHS: Record<string, number> = {
    AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
    BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29,
    ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
    HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IR: 26, IS: 26, IT: 27, JO: 30, KW: 30,
    KZ: 20, LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22,
    MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25,
    QA: 29, RO: 24, RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, TL: 23,
    TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20
    // Dacă lipsește o țară, folosim fallback 15–34.
  };

  ibanAnyCountry(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      const raw = (c.value ?? '').toString().replace(/\s+/g, '').toUpperCase();
      if (!raw) return null; // 'required' în componentă

      // 2 litere țară + 2 cifre + rest alfanumeric
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(raw)) return { iban: true };

      const cc = raw.slice(0, 2);
      const len = raw.length;

      // Lungime: exactă dacă știm țara; altfel 15–34
      const expectedLen = CustomValidatorsService.IBAN_LENGTHS[cc];
      if (expectedLen ? len !== expectedLen : (len < 15 || len > 34)) return { iban: true };

      // Mutăm primele 4 caractere la final
      const rearranged = raw.slice(4) + raw.slice(0, 4);

      // Mod 97 incremental (fără BigInt)
      let rem = 0;
      for (let i = 0; i < rearranged.length; i++) {
        const code = rearranged.charCodeAt(i);
        if (code >= 65 && code <= 90) {
          // literă -> 10..35
          const num = String(code - 55);
          for (let j = 0; j < num.length; j++) {
            rem = (rem * 10 + (num.charCodeAt(j) - 48)) % 97;
          }
        } else {
          // cifră
          rem = (rem * 10 + (code - 48)) % 97;
        }
      }
      return rem === 1 ? null : { iban: true };
    };
  }
  cui(): ValidatorFn {
    const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = (control.value ?? '').toString().trim().toUpperCase();
      if (!raw) return null; // required se pune în componentă când e PJ

      const num = raw.replace(/^RO/i, '').replace(/\s+/g, '');
      if (!/^\d{2,10}$/.test(num)) return { invalidCUI: true };

      const digits = num.split('').map(Number);
      const checkDigit = digits[digits.length - 1];
      const base = digits.slice(0, -1);

      // pad la stânga la 9 cifre
      const padded = Array(9 - base.length).fill(0).concat(base);

      let sum = 0;
      for (let i = 0; i < 9; i++) sum += padded[i] * weights[i];

      const mod = sum % 11;
      const calc = mod === 10 ? 0 : mod;

      return calc === checkDigit ? null : { invalidCUI: true };
    };
  }

  // --- helpers private ---
  private isCNPValid(cnp: string): boolean {
    const sDigit = parseInt(cnp.charAt(0), 10);
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(sDigit)) return false;
    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    const checkDigit = parseInt(cnp.charAt(12), 10);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(cnp.charAt(i), 10) * weights[i];
    const calc = sum % 11 === 10 ? 1 : sum % 11;
    return checkDigit === calc;
  }

  ibanRO(): ValidatorFn {
  // Pattern general IBAN + check pentru lungime RO + checksum mod 97
  return (c: AbstractControl): ValidationErrors | null => {
    const raw = (c.value ?? '').toString().replace(/\s+/g, '').toUpperCase();
    if (!raw) return null; // 'required' se pune în componentă

    // trebuie să înceapă cu RO
    if (!raw.startsWith('RO')) return { ibanRON: true };

    // structură minimă: RO + 2 cifre (checksum) + 4 litere (cod bancă) + 16 cifre (BBAN RO)
    // standardul permite A-Z0-9 în BBAN, dar în practică RO folosește cifre în partea numerică
    if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(raw)) return { ibanRON: true };

    // lungime exactă pentru România = 24
    if (raw.length !== 24) return { ibanRON: true };

    // checksum mod 97
    const rearranged = raw.slice(4) + raw.slice(0, 4);
    let rem = 0;
    for (let i = 0; i < rearranged.length; i++) {
      const code = rearranged.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        const num = String(code - 55);
        for (let j = 0; j < num.length; j++) {
          rem = (rem * 10 + (num.charCodeAt(j) - 48)) % 97;
        }
      } else {
        rem = (rem * 10 + (code - 48)) % 97;
      }
    }
    return rem === 1 ? null : { ibanRON: true };
  };
}
}
