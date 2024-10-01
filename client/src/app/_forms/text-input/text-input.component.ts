import { Component, Input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent implements ControlValueAccessor {

  @Input() label: string = '';  // Label for the input
  @Input() type: string = 'text';  // Type of the input (e.g., text, password, email)
  
  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;  // Set this component as the value accessor
  }

  // Write a new value to the element
  writeValue(value: any): void {
    this.control.setValue(value);
  }

  // Register a callback function to handle changes
  registerOnChange(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }

  // Register a callback function to handle touch events
  registerOnTouched(fn: any): void {
    // Angular doesn't provide a way to track touched by default, so we do nothing here
  }

  // Getter to access the form control
  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }

  // Optional: Method to handle the disabled state of the control
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }
}
