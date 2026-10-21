# ფინანსური სისტემის დოკუმენტაცია

## შინაარსი
1. [ზოგადი მიმოხილვა](#ზოგადი-მიმოხილვა)
2. [ცენტრალური გამოთვლების ბიბლიოთეკა](#ცენტრალური-გამოთვლების-ბიბლიოთეკა)
3. [მონაცემთა წყაროები](#მონაცემთა-წყაროები)
4. [ხელფასების სისტემა](#ხელფასების-სისტემა)
5. [ბიუჯეტის მართვა](#ბიუჯეტის-მართვა)
6. [ზეგანაკვეთური სამუშაო](#ზეგანაკვეთური-სამუშაო)
7. [კომპენსაციები და ბონუსები](#კომპენსაციები-და-ბონუსები)
8. [ფინანსური ანგარიშები](#ფინანსური-ანგარიშები)
9. [გამოთვლების ლოგიკა](#გამოთვლების-ლოგიკა)

---

## ზოგადი მიმოხილვა

ფინანსური სისტემა მოიცავს ხელფასების დარიცხვას, ბიუჯეტის დაგეგმვას, ხარჯების აღრიცხვას, ზეგანაკვეთური სამუშაოს აღრიცხვას და კომპენსაციების მართვას. სისტემა ინტეგრირებულია დასწრების აღრიცხვასთან, შვებულებებთან და სამუშაო გრაფიკებთან.

### მთავარი კომპონენტები:
- **Financial Calculations Library** - `src/lib/financialCalculations.ts` - ცენტრალური გამოთვლების ბიბლიოთეკა
- **Payroll (ხელფასები)** - `src/pages/Payroll.tsx`
- **Pension Payments (პენსია)** - `src/pages/PensionPayments.tsx`
- **Budget Planning (ბიუჯეტის დაგეგმვა)** - `src/pages/BudgetPlanning.tsx`
- **Budget Expenses (ხარჯები)** - `src/pages/BudgetExpenses.tsx`
- **Overtime (ზეგანაკვეთური)** - `src/pages/OvertimeReports.tsx`
- **Compensation (კომპენსაცია)** - `src/pages/Compensation.tsx`
- **Reports (ანგარიშები)** - `src/pages/FinancialReports.tsx`

---

## ცენტრალური გამოთვლების ბიბლიოთეკა

### 📍 მდებარეობა
ფაილი: `src/lib/financialCalculations.ts`

### 🎯 მიზანი
ყველა ფინანსური გამოთვლა ერთ ადგილას - დუბლირების და შეუსაბამობების თავიდან აცილება.

### 🔢 კონსტანტები

```typescript
export const FINANCIAL_CONSTANTS = {
  // საპენსიო გადასახადები (ქართული კანონმდებლობა 2025)
  PENSION_EMPLOYEE_RATE: 0.02,      // 2% თანამშრომელი
  PENSION_EMPLOYER_RATE: 0.02,      // 2% დამსაქმებელი
  
  // საშემოსავლო გადასახადი
  INCOME_TAX_RATE: 0.20,             // 20%
  INCOME_TAX_THRESHOLD: 600,         // 600₾ ზემოთ
  
  // ზეგანაკვეთური კოეფიციენტები
  OVERTIME_MULTIPLIER: 1.5,          // სტანდარტული x1.5
  HOLIDAY_OVERTIME_MULTIPLIER: 2.0,  // დღესასწაული x2.0
  
  // სამუშაო საათები
  STANDARD_MONTHLY_HOURS: 160,       // სტანდარტული თვე
  STANDARD_DAILY_HOURS: 8,           // სამუშაო დღე
  WORKING_DAYS_PER_MONTH: 20,        // საშუალო დღეები
};
```

### 📚 ძირითადი ფუნქციები

#### 1. საათობრივი განაკვეთი
```typescript
calculateHourlyRate(baseSalary: number, monthlyHours?: number): number
```
გამოთვლის საათობრივ განაკვეთს საბაზო ხელფასიდან.

**მაგალითი:**
```typescript
const hourlyRate = calculateHourlyRate(3200); // 3200 / 160 = 20₾/სთ
```

#### 2. საპენსიო გადასახადი
```typescript
calculatePensionContribution(baseSalary: number): PensionContribution
```
აბრუნებს:
- `employeeContribution` - 2% თანამშრომელი
- `employerContribution` - 2% დამსაქმებელი
- `totalAmount` - ჯამი

**მაგალითი:**
```typescript
const pension = calculatePensionContribution(3200);
// { employeeContribution: 64, employerContribution: 64, totalAmount: 128 }
```

#### 3. საშემოსავლო გადასახადი
```typescript
calculateIncomeTax(grossIncome: number): number
```
20% 600₾-ის ზემოთ გადასახადი.

**მაგალითი:**
```typescript
const tax = calculateIncomeTax(3200); // (3200 - 600) × 0.20 = 520₾
```

#### 4. ზეგანაკვეთური ბონუსი
```typescript
calculateOvertimeBonus(hours: number, hourlyRate: number, multiplier?: number): number
```

**მაგალითი:**
```typescript
// სტანდარტული ზეგანაკვეთური (x1.5)
const bonus = calculateOvertimeBonus(10, 20); // 10 × 20 × 1.5 = 300₾

// დღესასწაულის ზეგანაკვეთური (x2.0)
const holidayBonus = calculateOvertimeBonus(8, 20, 2.0); // 8 × 20 × 2.0 = 320₾
```

#### 5. დღესასწაულის ზეგანაკვეთური
```typescript
calculateHolidayOvertimeBonus(
  attendance: Attendance[], 
  holidays: PublicHoliday[], 
  hourlyRate: number
): { hours: number; bonus: number }
```

ავტომატურად ამოწმებს დასწრების ჩანაწერებს დღესასწაულების ფონზე და ითვლის ზეგანაკვეთურ საათებს კოეფიციენტით.

#### 6. სრული ხელფასის გამოთვლა
```typescript
calculateFullPayroll(params: {
  baseSalary: number;
  manualBonuses?: number;
  manualDeductions?: number;
  overtimeHours?: number;
  holidayOvertimeHours?: number;
  monthlyHours?: number;
  hasPension?: boolean;
}): PayrollCalculation
```

**აბრუნებს:**
```typescript
{
  baseSalary: number;        // საბაზო
  totalBonuses: number;      // ჯამური ბონუსები
  totalDeductions: number;   // ჯამური დაქვითვები
  grossSalary: number;       // მთლიანი (გადასახადამდე)
  netSalary: number;         // წმინდა
  pensionEmployee: number;   // პენსია (თანამშრომელი)
  pensionEmployer: number;   // პენსია (დამსაქმებელი)
  incomeTax: number;         // საშემოსავლო გადასახადი
  hourlyRate: number;        // საათობრივი განაკვეთი
}
```

**მაგალითი:**
```typescript
const payroll = calculateFullPayroll({
  baseSalary: 3200,
  overtimeHours: 10,
  holidayOvertimeHours: 8,
  hasPension: true
});

// შედეგი:
// baseSalary: 3200
// hourlyRate: 20
// totalBonuses: 620 (10×20×1.5 + 8×20×2.0)
// pensionEmployee: 64
// incomeTax: 764 ((3200+620-600)×0.2)
// totalDeductions: 828
// netSalary: 2992
```

#### 7. შვებულების გადახდა
```typescript
calculateLeavePayment(
  baseSalary: number,
  days: number,
  leaveType: 'maternity' | 'paternity' | 'sick' | 'annual'
): number
```

- ავადმყოფობა: 70% დღიური განაკვეთი
- დეკრეტული/შვებულება: 100% დღიური განაკვეთი

### 🔄 გამოყენების მაგალითები

#### Payroll.tsx-ში
```typescript
import { calculateFullPayroll, FINANCIAL_CONSTANTS } from '@/lib/financialCalculations';

const result = calculateFullPayroll({
  baseSalary: employee.salary,
  overtimeHours: approvedOvertimeHours,
  holidayOvertimeHours: holidayHours,
  hasPension: employee.has_pension
});

await supabase.from('payroll').insert({
  employee_id: employee.id,
  base_salary: result.baseSalary,
  bonuses: result.totalBonuses,
  deductions: result.totalDeductions,
  net_salary: result.netSalary
});
```

#### Edge Function-ში
```typescript
import { calculateFullPayroll } from '../../../src/lib/financialCalculations.ts';

const payroll = calculateFullPayroll({
  baseSalary: employee.salary,
  overtimeHours: totalOvertimeHours,
  holidayOvertimeHours: totalHolidayHours,
  hasPension: employee.has_pension
});
```

---

## მონაცემთა წყაროები

### Supabase ცხრილები

#### 1. **employees** (თანამშრომლები)
```sql
- id: თანამშრომლის უნიკალური ID
- full_name: სახელი და გვარი
- position: პოზიცია
- department_id: დეპარტამენტის ID
- salary: საბაზო ხელფასი
- hourly_rate: საათობრივი განაკვეთი
- hire_date: დაქირავების თარიღი
- status: სტატუსი (active/inactive)
```

#### 2. **payroll** (ხელფასები)
```sql
- id: ჩანაწერის ID
- employee_id: თანამშრომლის ID
- month: თვე (1-12)
- year: წელი
- base_salary: საბაზო ხელფასი
- bonuses: ბონუსები
- deductions: დაკავებები
- overtime_pay: ზეგანაკვეთური
- holiday_overtime_pay: დღესასწაულების ზეგანაკვეთური
- net_salary: წმინდა ხელფასი
- status: სტატუსი (pending/paid)
- payment_date: გადახდის თარიღი
- pension_contribution: პენსიის შენატანი
```

#### 3. **budget_plans** (ბიუჯეტის გეგმები)
```sql
- id: გეგმის ID
- department_id: დეპარტამენტის ID
- fiscal_year: ფისკალური წელი
- fiscal_quarter: კვარტალი (1-4)
- fiscal_month: თვე (1-12)
- category: კატეგორია
- planned_amount: დაგეგმილი თანხა
- actual_amount: ფაქტობრივი თანხა
- variance: ვარიანსი (განსხვავება)
- status: სტატუსი (pending/approved/rejected)
```

#### 4. **budget_expenses** (ბიუჯეტის ხარჯები)
```sql
- id: ხარჯის ID
- department_id: დეპარტამენტის ID
- category: კატეგორია
- amount: თანხა
- expense_date: ხარჯის თარიღი
- description: აღწერა
- status: სტატუსი (pending/approved/rejected)
- fiscal_year: ფისკალური წელი
- fiscal_quarter: კვარტალი
- fiscal_month: თვე
```

#### 5. **overtime_requests** (ზეგანაკვეთური განაცხადები)
```sql
- id: განაცხადის ID
- employee_id: თანამშრომლის ID
- date: თარიღი
- hours: საათების რაოდენობა
- overtime_type: ტიპი (weekday/weekend/holiday)
- reason: მიზეზი
- status: სტატუსი (pending/approved/rejected)
- approved_by: დამამტკიცებელი
- approved_at: დამტკიცების თარიღი
```

#### 6. **attendance** (დასწრება)
```sql
- id: ჩანაწერის ID
- employee_id: თანამშრომლის ID
- date: თარიღი
- check_in: შემოსვლის დრო
- check_out: გასვლის დრო
- status: სტატუსი (present/absent/late)
- overtime_hours: ზეგანაკვეთური საათები
- break_duration: შესვენების ხანგრძლივობა
```

#### 7. **leave_requests** (შვებულების განაცხადები)
```sql
- id: განაცხადის ID
- employee_id: თანამშრომლის ID
- leave_type: შვებულების ტიპი
- start_date: დაწყების თარიღი
- end_date: დასრულების თარიღი
- status: სტატუსი (pending/approved/rejected)
- total_days: დღეების რაოდენობა
```

#### 8. **public_holidays** (სახელმწიფო უქმე დღეები)
```sql
- id: დღესასწაულის ID
- name: დასახელება
- date: თარიღი
- is_recurring: განმეორებადი თუ არა
```

#### 9. **compensation_bands** (კომპენსაციის დიაპაზონები)
```sql
- id: დიაპაზონის ID
- position: პოზიცია
- department_id: დეპარტამენტი
- min_salary: მინიმალური ხელფასი
- mid_salary: საშუალო ხელფასი
- max_salary: მაქსიმალური ხელფასი
- currency: ვალუტა
```

#### 10. **employee_bonuses** (თანამშრომლების ბონუსები)
```sql
- id: ბონუსის ID
- employee_id: თანამშრომლის ID
- amount: თანხა
- bonus_type: ბონუსის ტიპი
- reason: მიზეზი
- payment_date: გადახდის თარიღი
- status: სტატუსი (pending/approved/paid)
```

---

## ხელფასების სისტემა

### მდებარეობა
ფაილი: `src/pages/Payroll.tsx`

### მონაცემთა მოპოვება

#### 1. თანამშრომლების სია
```typescript
const { data: employeesData } = await supabase
  .from('employees')
  .select('*, departments(name)')
  .eq('status', 'active')
  .order('full_name');
```

#### 2. არსებული ხელფასების ჩანაწერები
```typescript
const { data: existingPayrolls } = await supabase
  .from('payroll')
  .select(`
    *,
    employees (
      id,
      full_name,
      position,
      salary,
      hourly_rate,
      departments (name)
    )
  `)
  .eq('month', selectedMonth)
  .eq('year', selectedYear);
```

#### 3. დღესასწაულების ზეგანაკვეთური საათების დათვლა
```typescript
// 1. დღესასწაულების სია
const { data: holidays } = await supabase
  .from('public_holidays')
  .select('date')
  .gte('date', `${selectedYear}-${selectedMonth}-01`)
  .lte('date', `${selectedYear}-${selectedMonth}-${lastDay}`);

// 2. დასწრების ჩანაწერები დღესასწაულებში
const { data: holidayAttendance } = await supabase
  .from('attendance')
  .select('employee_id, overtime_hours')
  .in('date', holidayDates);

// 3. საათების დაჯამება თანამშრომლის მიხედვით
const holidayOvertimeHours = holidayAttendance.reduce((acc, record) => {
  acc[record.employee_id] = (acc[record.employee_id] || 0) + (record.overtime_hours || 0);
  return acc;
}, {});
```

### გამოთვლების ლოგიკა

⚠️ **მნიშვნელოვანი:** ყველა გამოთვლა ახლა გამოიყენება `src/lib/financialCalculations.ts`-დან

#### სრული ხელფასის გამოთვლა
```typescript
import { calculateFullPayroll } from '@/lib/financialCalculations';

const result = calculateFullPayroll({
  baseSalary: employee.salary,
  manualBonuses: parseFloat(formData.bonuses) || 0,
  manualDeductions: parseFloat(formData.deductions) || 0,
  overtimeHours: approvedOvertimeHours,
  holidayOvertimeHours: holidayOvertimeHours,
  hasPension: employee.has_pension
});

// result-ი შეიცავს:
// - baseSalary: საბაზო ხელფასი
// - totalBonuses: ბონუსები (manual + overtime + holiday)
// - totalDeductions: დაქვითვები (manual + pension + tax)
// - grossSalary: მთლიანი
// - netSalary: წმინდა
// - pensionEmployee: პენსია (2%)
// - pensionEmployer: პენსია (2%)
// - incomeTax: საშემოსავლო (20% 600₾ ზემოთ)
// - hourlyRate: საათობრივი განაკვეთი
```

### ჩანაწერის შენახვა
```typescript
const payrollData = {
  employee_id: employee.id,
  month: selectedMonth,
  year: selectedYear,
  base_salary: baseSalary,
  bonuses: totalBonuses,
  deductions: totalDeductions,
  overtime_pay: 0, // რეგულარული ზეგანაკვეთური
  holiday_overtime_pay: holidayOvertimePay,
  net_salary: netSalary,
  status: 'pending',
  pension_contribution: pensionContribution,
  created_by: user?.id
};

await supabase.from('payroll').insert([payrollData]);
```

---

## ბიუჯეტის მართვა

### Budget Planning (ბიუჯეტის დაგეგმვა)
ფაილი: `src/pages/BudgetPlanning.tsx`

#### მონაცემთა სტრუქტურა
```typescript
interface BudgetPlan {
  id: string;
  department_id: string;
  fiscal_year: number;
  fiscal_quarter: number;
  fiscal_month: number;
  category: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  status: 'pending' | 'approved' | 'rejected';
}
```

#### კატეგორიები
- Salaries (ხელფასები)
- Benefits (შეღავათები)
- Training (ტრენინგი)
- Equipment (აღჭურვილობა)
- Marketing (მარკეტინგი)
- Operations (ოპერაციები)
- Other (სხვა)

### Budget Expenses (ბიუჯეტის ხარჯები)
ფაილი: `src/pages/BudgetExpenses.tsx`

#### მონაცემთა მოპოვება
```typescript
const { data, error } = await supabase
  .from('budget_expenses')
  .select(`
    *,
    departments (
      id,
      name
    ),
    created_by_profile:created_by (full_name)
  `)
  .order('expense_date', { ascending: false });
```

#### ფილტრაცია
```typescript
const filteredExpenses = useMemo(() => {
  return expenses.filter(expense => {
    // სტატუსით
    if (filters.status && expense.status !== filters.status) return false;
    
    // კატეგორიით
    if (filters.category && expense.category !== filters.category) return false;
    
    // დეპარტამენტით
    if (filters.department && expense.department_id !== filters.department) return false;
    
    // თარიღის დიაპაზონით
    if (filters.startDate && new Date(expense.expense_date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(expense.expense_date) > new Date(filters.endDate)) return false;
    
    return true;
  });
}, [expenses, filters]);
```

#### ანალიტიკა
```typescript
// კატეგორიის მიხედვით
const categoryData = Object.entries(
  approvedExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));

// დეპარტამენტის მიხედვით
const departmentData = Object.entries(
  approvedExpenses.reduce((acc, expense) => {
    const deptName = expense.departments?.name || 'N/A';
    acc[deptName] = (acc[deptName] || 0) + Number(expense.amount);
    return acc;
  }, {})
).map(([name, value]) => ({ name, value }));
```

---

## ზეგანაკვეთური სამუშაო

### Overtime Reports (ზეგანაკვეთურის ანგარიში)
ფაილი: `src/pages/OvertimeReports.tsx`

### მონაცემთა მოპოვება
```typescript
const { data: overtimeData } = await supabase
  .from('overtime_requests')
  .select(`
    *,
    employees!inner (
      id,
      full_name,
      position,
      hourly_rate,
      department_id,
      departments (name)
    )
  `)
  .eq('status', 'approved')
  .gte('date', startDate)
  .lte('date', endDate);
```

### ზეგანაკვეთურის ტიპები და მულტიპლიკატორები
```typescript
const OVERTIME_MULTIPLIERS = {
  weekday: 1.5,   // სამუშაო დღე - x1.5
  weekend: 2.0,   // შაბათ-კვირა - x2.0
  holiday: 2.0    // დღესასწაული - x2.0
};
```

### გამოთვლები

#### 1. თანამშრომლის სტატისტიკა
```typescript
const stats = overtimeData.reduce((acc, request) => {
  const employeeId = request.employee_id;
  
  if (!acc[employeeId]) {
    acc[employeeId] = {
      employee_id: employeeId,
      full_name: request.employees.full_name,
      position: request.employees.position,
      department: request.employees.departments?.name,
      total_hours: 0,
      weekday_hours: 0,
      weekend_hours: 0,
      holiday_hours: 0,
      total_cost: 0
    };
  }
  
  const hours = Number(request.hours) || 0;
  const hourlyRate = Number(request.employees.hourly_rate) || 0;
  const multiplier = OVERTIME_MULTIPLIERS[request.overtime_type] || 1;
  const cost = hours * hourlyRate * multiplier;
  
  acc[employeeId].total_hours += hours;
  acc[employeeId][`${request.overtime_type}_hours`] += hours;
  acc[employeeId].total_cost += cost;
  
  return acc;
}, {});
```

#### 2. თვიური ჯამური სტატისტიკა
```typescript
const monthlyStats = {
  total_employees: Object.keys(stats).length,
  total_hours: Object.values(stats).reduce((sum, s) => sum + s.total_hours, 0),
  total_cost: Object.values(stats).reduce((sum, s) => sum + s.total_cost, 0),
  average_hours: total_hours / total_employees,
  weekday_hours: sum of all weekday hours,
  weekend_hours: sum of all weekend hours,
  holiday_hours: sum of all holiday hours
};
```

### Dashboard Widget
ფაილი: `src/components/dashboard/OvertimeWidget.tsx`

#### ამჟამინდელი თვის მონაცემები
```typescript
const currentMonthStart = startOfMonth(new Date());
const currentMonthEnd = endOfMonth(new Date());

const { data: currentMonthData } = await supabase
  .from('overtime_requests')
  .select('*, employees!inner(hourly_rate)')
  .eq('status', 'approved')
  .gte('date', format(currentMonthStart, 'yyyy-MM-dd'))
  .lte('date', format(currentMonthEnd, 'yyyy-MM-dd'));
```

#### წინა თვის მონაცემები (ტენდენციისთვის)
```typescript
const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

const { data: previousMonthData } = await supabase
  .from('overtime_requests')
  .select('hours')
  .eq('status', 'approved')
  .gte('date', format(previousMonthStart, 'yyyy-MM-dd'))
  .lte('date', format(previousMonthEnd, 'yyyy-MM-dd'));
```

#### ტენდენციის გამოთვლა
```typescript
const trend = totalHours > previousMonthHours ? 'up' : 'down';
const trendPercentage = previousMonthHours > 0 
  ? Math.abs(((totalHours - previousMonthHours) / previousMonthHours) * 100)
  : 0;
```

---

## კომპენსაციები და ბონუსები

### Compensation (კომპენსაცია)
ფაილი: `src/pages/Compensation.tsx`

### კომპენსაციის დიაპაზონები
```typescript
const { data: compensationBands } = await supabase
  .from('compensation_bands')
  .select(`
    *,
    departments (name)
  `)
  .eq('is_active', true)
  .order('position');
```

### თანამშრომლის ბონუსები
```typescript
const { data: bonuses } = await supabase
  .from('employee_bonuses')
  .select('*')
  .eq('employee_id', currentEmployeeId)
  .order('payment_date', { ascending: false });
```

---

## ფინანსური ანგარიშები

### Reports Page
ფაილი: `src/pages/Reports.tsx`

### ანგარიშის ტიპები
1. **Employees** - თანამშრომლების ანგარიში
2. **Attendance** - დასწრების ანგარიში
3. **Payroll** - ხელფასების ანგარიში
4. **Leave** - შვებულებების ანგარიში
5. **Work Hours** - სამუშაო საათების ანგარიში
6. **Lateness** - დაგვიანებების ანგარიში
7. **Overtime** - ზეგანაკვეთურის ანგარიში
8. **Absences** - არყოფნის ანგარიში
9. **Leave/Sick** - შვებულება/ბიულეტენის ანგარიში
10. **Full Financial Report** - სრული ფინანსური ანგარიში

### სრული ფინანსური ანგარიში

#### მონაცემთა მოპოვება
```typescript
// 1. თანამშრომლები
const { data: employees } = await supabase
  .from('employees')
  .select('*, departments(name)')
  .eq('status', 'active');

// 2. ბიუჯეტის გეგმები
const { data: budgetPlans } = await supabase
  .from('budget_plans')
  .select('*, departments(name)')
  .gte('created_at', startDate)
  .lte('created_at', endDate);

// 3. ბიუჯეტის ხარჯები
const { data: budgetExpenses } = await supabase
  .from('budget_expenses')
  .select('*, departments(name)')
  .eq('status', 'approved')
  .gte('expense_date', startDate)
  .lte('expense_date', endDate);

// 4. დასწრება (ზეგანაკვეთურისთვის)
const { data: attendance } = await supabase
  .from('attendance')
  .select('*, employees(*)')
  .gte('date', startDate)
  .lte('date', endDate);

// 5. შვებულებები
const { data: leaveRequests } = await supabase
  .from('leave_requests')
  .select('*, employees(*)')
  .eq('status', 'approved')
  .gte('start_date', startDate)
  .lte('end_date', endDate);
```

#### გამოთვლები

##### 1. ხელფასების ფურცელი (Payroll Sheet)
```typescript
const payrollSheet = employees.map(emp => ({
  'თანამშრომელი': emp.full_name,
  'პოზიცია': emp.position,
  'დეპარტამენტი': emp.departments?.name,
  'საბაზო ხელფასი': Number(emp.salary) || 0,
  'საათობრივი განაკვეთი': Number(emp.hourly_rate) || 0,
  'პენსიის შენატანი': (Number(emp.salary) || 0) * 0.02
}));
```

##### 2. ზეგანაკვეთური (Overtime)
```typescript
// სამუშაო დღეების ზეგანაკვეთური
const weekdayOvertime = attendance
  .filter(a => a.overtime_hours > 0 && !isWeekend && !isHoliday)
  .map(a => ({
    'თანამშრომელი': a.employees.full_name,
    'თარიღი': a.date,
    'საათები': a.overtime_hours,
    'საათობრივი განაკვეთი': a.employees.hourly_rate,
    'მულტიპლიკატორი': 1.5,
    'ღირებულება': a.overtime_hours * a.employees.hourly_rate * 1.5
  }));
```

##### 3. შაბათ-კვირის მუშაობა (Weekend Work)
```typescript
const weekendWork = attendance
  .filter(a => isWeekend(new Date(a.date)))
  .map(a => ({
    'თანამშრომელი': a.employees.full_name,
    'თარიღი': a.date,
    'საათები': calculateHours(a.check_in, a.check_out),
    'საათობრივი განაკვეთი': a.employees.hourly_rate,
    'მულტიპლიკატორი': 2.0,
    'ღირებულება': hours * a.employees.hourly_rate * 2.0
  }));
```

##### 4. დღესასწაულების მუშაობა (Holiday Work)
```typescript
const { data: holidays } = await supabase
  .from('public_holidays')
  .select('date')
  .gte('date', startDate)
  .lte('date', endDate);

const holidayWork = attendance
  .filter(a => holidayDates.includes(a.date))
  .map(a => ({
    'თანამშრომელი': a.employees.full_name,
    'თარიღი': a.date,
    'საათები': calculateHours(a.check_in, a.check_out),
    'საათობრივი განაკვეთი': a.employees.hourly_rate,
    'მულტიპლიკატორი': 2.0,
    'ღირებულება': hours * a.employees.hourly_rate * 2.0
  }));
```

##### 5. შვებულებები (Leave Requests)
```typescript
const leaveSheet = leaveRequests.map(leave => {
  const days = differenceInDays(
    new Date(leave.end_date),
    new Date(leave.start_date)
  ) + 1;
  
  const dailyRate = leave.employees.salary / 30;
  
  return {
    'თანამშრომელი': leave.employees.full_name,
    'ტიპი': leave.leave_type,
    'დაწყება': leave.start_date,
    'დასრულება': leave.end_date,
    'დღეები': days,
    'დღიური განაკვეთი': dailyRate,
    'ღირებულება': days * dailyRate
  };
});
```

#### ჯამური გამოთვლები
```typescript
const totalPayroll = payrollSheet.reduce((sum, row) => 
  sum + row['საბაზო ხელფასი'], 0
);

const totalExpenses = expensesSheet.reduce((sum, row) => 
  sum + row['თანხა'], 0
);

const totalOvertime = overtimeSheet.reduce((sum, row) => 
  sum + row['ღირებულება'], 0
);

const totalWeekend = weekendSheet.reduce((sum, row) => 
  sum + row['ღირებულება'], 0
);

const totalHoliday = holidaySheet.reduce((sum, row) => 
  sum + row['ღირებულება'], 0
);

const totalLeave = leaveSheet.reduce((sum, row) => 
  sum + row['ღირებულება'], 0
);

const totalCosts = totalPayroll + totalExpenses + totalOvertime + 
                   totalWeekend + totalHoliday + totalLeave;
```

### PDF Export
ფაილი: `src/lib/exportFinancialPDF.ts`

PDF-ში ექსპორტი მოიცავს:
1. **სათაურს და პერიოდს**
2. **ფინანსურ მიმოხილვას** (ჯამური თანხები)
3. **ხარჯების განაწილებას** (პროცენტულად)
4. **დეტალურ ფურცლებს** თითოეული კატეგორიისთვის

---

## გამოთვლების ლოგიკა

### 1. ხელფასის დათვლა
```
წმინდა ხელფასი = საბაზო ხელფასი + ბონუსები - დაკავებები

სადაც:
- საბაზო ხელფასი = employee.salary
- ბონუსები = ხელით შეყვანილი + დღესასწაულების ზეგანაკვეთური
- დაკავებები = ხელით შეყვანილი + პენსიის შენატანი (2%)
```

### 2. ზეგანაკვეთურის დათვლა
```
ზეგანაკვეთურის ღირებულება = საათები × საათობრივი განაკვეთი × მულტიპლიკატორი

მულტიპლიკატორები:
- სამუშაო დღე: 1.5
- შაბათ-კვირა: 2.0
- დღესასწაული: 2.0
```

### 3. პენსიის შენატანი
```
თანამშრომლის ნაწილი = საბაზო ხელფასი × 0.02 (2%)
დამსაქმებლის ნაწილი = საბაზო ხელფასი × 0.02 (2%)
სულ = საბაზო ხელფასი × 0.04 (4%)
```

### 4. შვებულების ღირებულება
```
დღიური განაკვეთი = თვიური ხელფასი / 30
შვებულების ღირებულება = დღიური განაკვეთი × დღეების რაოდენობა
```

### 5. სამუშაო საათების დათვლა
```
სამუშაო საათები = (გასვლის დრო - შემოსვლის დრო) - შესვენება
ზეგანაკვეთური საათები = სამუშაო საათები - სტანდარტული საათები (8)
```

---

## მონაცემთა ნაკადი (Data Flow)

```
1. თანამშრომლის რეგისტრაცია
   ↓
2. სამუშაო გრაფიკის მინიჭება
   ↓
3. დასწრების აღრიცხვა (ყოველდღიური)
   ↓
4. ზეგანაკვეთურის განაცხადები
   ↓
5. შვებულების განაცხადები
   ↓
6. ხელფასის დარიცხვა (თვიური)
   ↓
7. ფინანსური ანგარიშები
```

### ინტეგრაციები

1. **დასწრება → ხელფასები**
   - ზეგანაკვეთური საათები → ზეგანაკვეთურის ანაზღაურება
   - დაგვიანებები → დაკავებები

2. **შვებულებები → ხელფასები**
   - შვებულების დღეები → ანაზღაურებადი დღეები
   - ბიულეტენი → სამედიცინო გადახდები

3. **ბიუჯეტი → ხარჯები**
   - დაგეგმილი თანხა → ფაქტობრივი თანხა → ვარიანსი

4. **დღესასწაულები → დასწრება → ხელფასები**
   - დღესასწაულებში მუშაობა → x2 მულტიპლიკატორი

---

## უსაფრთხოება და წვდომა (RLS Policies)

### Payroll Table
```sql
-- მხოლოდ ადმინებსა და HR-ს შეუძლიათ ხელფასების ნახვა
CREATE POLICY "Admins and HR can view payroll"
ON payroll FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- მხოლოდ ადმინებსა და HR-ს შეუძლიათ ხელფასების შექმნა/რედაქტირება
CREATE POLICY "Admins and HR can manage payroll"
ON payroll FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
```

### Budget Expenses
```sql
-- დეპარტამენტის მენეჯერებს შეუძლიათ საკუთარი დეპარტამენტის ხარჯების ნახვა
CREATE POLICY "Department managers can view their expenses"
ON budget_expenses FOR SELECT
USING (
  department_id IN (
    SELECT id FROM departments WHERE manager_id = get_current_employee_id()
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'hr_manager')
);
```

---

## დასკვნა

ფინანსური სისტემა არის სრულად ინტეგრირებული მოდული, რომელიც:
- აღრიცხავს ხელფასებს ყველა კომპონენტით
- მართავს ბიუჯეტს და ხარჯებს
- ითვლის ზეგანაკვეთურს სხვადასხვა მულტიპლიკატორებით
- აწარმოებს დეტალურ ფინანსურ ანგარიშებს
- უზრუნველყოფს მონაცემთა უსაფრთხოებას RLS პოლისებით

ყველა გამოთვლა ხდება რეალურ დროში მონაცემთა ბაზიდან მიღებული ინფორმაციის საფუძველზე.
