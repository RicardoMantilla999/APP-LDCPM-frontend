import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  constructor(private toast: ToastrService) { }


  showSuccess(texto, titulo) {
    this.toast.success(texto, titulo);
  }

  showError(texto, titulo) {
    this.toast.error(texto, titulo);
  }

  showInfo(texto, titulo) {
    this.toast.info(texto, titulo);
  }

  showWarning(texto, titulo) {
    this.toast.warning(texto, titulo);
  }

}
