import {Component, Input, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LanguageService} from '@core/services';
import {requireOneOf} from '@core/validators';
import {ExpensesElement} from '@expenses-items/models';

@Component({
    selector: 'app-expense-element',
    templateUrl: './expense-element.component.html',
    styleUrl: './expense-element.component.scss',
    standalone: false
})
export class ExpenseElementComponent implements OnInit {
  @Input() elements!: FormArray;

  elementForm!: FormGroup;

  isEditingElement = false;

  editedElementIndex: number | null = null;

  mode: 'add' | 'edit' | 'view' = 'add';

  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'];
    this.initializeForm();
  }

  getControl(name: string) {
    return this.elementForm?.get(name) as FormControl;
  }

  initializeForm() {
    this.elementForm = this.fb.group(
      {
        name: [null, Validators.required],
        nameAr: [null, Validators.required],
        value: [null, [Validators.required, Validators.min(0)]],
      },
      {validators: [requireOneOf(['name', 'nameAr'])]},
    );
  }

  submit() {
    if (this.elementForm.invalid) {
      this.elementForm.markAllAsTouched();
      return;
    }

    const value = this.elementForm.value;

    if (this.isEditingElement && this.editedElementIndex !== null) {
      this.updateExpenseElement(value);
    } else {
      this.addExpenseElement(value);
    }
    // Reset the form after submission
    this.elementForm.reset();
    this.isEditingElement = false;
    this.editedElementIndex = null;
  }

  addExpenseElement(value: ExpensesElement) {
    const newElementGroup = this.fb.group(
      {
        name: [value.name, Validators.required],
        nameAr: [value.nameAr, Validators.required],
        value: [+value.value, [Validators.required, Validators.min(0)]],
      },
      {validators: [requireOneOf(['name', 'nameAr'])]},
    );

    this.elements.insert(0, newElementGroup);
  }

  updateExpenseElement(value: ExpensesElement) {
    if (this.editedElementIndex !== null) {
      const elementGroup = this.elements.at(this.editedElementIndex);
      elementGroup.patchValue({
        name: value.name,
        nameAr: value.nameAr,
        value: +value.value,
      });
    }
  }

  deleteExpenseElement(index: number) {
    this.elements.removeAt(index);
  }

  editExpenseElement(index: number) {
    this.isEditingElement = true;
    this.editedElementIndex = index;

    const elementGroup = this.elements.at(index) as FormGroup;
    this.elementForm.patchValue({
      name: elementGroup.get('name')?.value,
      nameAr: elementGroup.get('nameAr')?.value,
      value: +elementGroup.get('value')?.value,
    });
  }

  cancelEdit() {
    this.isEditingElement = false;
    this.editedElementIndex = null;
    this.elementForm.reset();
  }
}
