# Teacher Access Control & Food Items Implementation Guide

## ✅ What Has Been Completed

### 1. **Teacher Access Control Implementation**

#### ClassTeacherDashboard (`src/App.tsx` line ~2246)
- ✅ Locked to single assigned class (`teacherInfo.classes[0]`)
- ✅ Removed class selector buttons
- ✅ Shows error if no class assigned
- ✅ Displays read-only class badge
- ✅ Pagination: 15 items per page with search functionality

#### ExamsManagement (`src/App.tsx` line ~4700)
- ✅ Class selection is read-only for teachers (shows badge)
- ✅ Headteachers can still select any grade
- ✅ Teachers automatically locked to their assigned class
- ✅ Pagination: 12 items per page maintained

#### Class Promotion Sync (`pages/api/students/[...slug].ts` line ~13)
- ✅ When students are promoted (e.g., PP1→PP2)
- ✅ Teacher `classes` array is automatically updated
- ✅ Uses PostgreSQL array operations to find affected teachers
- ✅ Response includes `teachersUpdated` count for verification

### 2. **Food Items Management**

#### Food Items API Endpoint (`pages/api/finance/food-items.ts`)
- ✅ GET: List all food items ordered by name
- ✅ POST: Create new food item (headteacher only)
- ✅ PATCH: Update food item (headteacher only)
- ✅ DELETE: Delete food item (headteacher only)
- ✅ Input validation and sanitization

#### FeesManagement Component (`src/App.tsx` line ~3920)
- ✅ Food items manager modal with add/delete capabilities
- ✅ Dynamic term selection (Term 1-3)
- ✅ Dynamic academic year selection (current ±2 years)
- ✅ Fee recording with tuition + food items breakdown
- ✅ Status legend explaining PAID/PENDING/PARTIAL
- ✅ Pagination: 15 items per page

#### Receipt Display (`pages/api/finance/receipt.ts`)
- ✅ Updated to display food items breakdown
- ✅ Shows individual food item quantities and costs
- ✅ Displays total tuition vs food items vs total amount
- ✅ Enhanced layout with clear separation of charges

---

## 📋 REQUIRED: Database Schema Changes

### Step 1: Create Food Items Table

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create school_food_items table for tracking food items that contribute to school fees
CREATE TABLE IF NOT EXISTS public.school_food_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_items_name ON public.school_food_items(name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.school_food_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow headteachers to manage food items
CREATE POLICY "headteachers_can_manage_food_items" ON public.school_food_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'headteacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'headteacher'
    )
  );

-- Policy: Allow all authenticated users to read food items
CREATE POLICY "all_authenticated_can_read_food_items" ON public.school_food_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add comment for documentation
COMMENT ON TABLE public.school_food_items IS 'Stores school food items (e.g., maize, beans) that students can purchase as additional fees';
COMMENT ON COLUMN public.school_food_items.name IS 'Food item name (e.g., "Maize", "Beans")';
COMMENT ON COLUMN public.school_food_items.unit_price IS 'Price per unit of food item';
COMMENT ON COLUMN public.school_food_items.description IS 'Optional description of the food item';
```

### Step 2: Update Fees Table

Execute this SQL in your Supabase SQL Editor:

```sql
-- Add food_items JSONB column to fees table to store food item purchases
ALTER TABLE public.fees 
ADD COLUMN IF NOT EXISTS food_items JSONB DEFAULT NULL;

-- Add tuition_amount column to separate tuition from total
ALTER TABLE public.fees 
ADD COLUMN IF NOT EXISTS tuition_amount DECIMAL(10, 2) DEFAULT NULL;

-- Create index on food_items for faster queries
CREATE INDEX IF NOT EXISTS idx_fees_food_items ON public.fees USING GIN (food_items);

-- Add comment for documentation
COMMENT ON COLUMN public.fees.food_items IS 'JSONB object storing food items purchased with format: {"item_name": {"quantity": num, "unit_price": num, "total": num}}';
COMMENT ON COLUMN public.fees.tuition_amount IS 'Portion of the total amount that is tuition (rest is food items)';
```

---

## 🧪 Testing Checklist

### Teacher Access Control Tests

- [ ] **ClassTeacher View**: Log in as a teacher assigned to PP1
  - Should see ONLY PP1 students in CBC Master Dashboard
  - Should NOT see a class selector dropdown
  - Search should work only on PP1 students

- [ ] **Exam Results Entry**: Log in as a teacher assigned to Grade 3
  - Should see Grade 3 displayed as read-only badge
  - Should NOT be able to change to another grade
  - Should see ONLY Grade 3 students in the table

- [ ] **Class Promotion**: As headteacher, promote PP1 to PP2
  - Verify: Teacher previously assigned to PP1 now shows PP2
  - Check promotion API response includes `teachersUpdated: 1`
  - Verify teacher can now access newly promoted class

### Food Items Tests

- [ ] **Add Food Items**: As headteacher in Bursary section
  - Add "Maize" (KSH 500)
  - Add "Beans" (KSH 300)
  - Verify they appear in the food items list

- [ ] **Record Fee with Food**: In FeesManagement
  - Select a student
  - Enter tuition: KSH 5000
  - Select 2 units of Maize (KSH 1000)
  - Select 1 unit of Beans (KSH 300)
  - Total should be: KSH 6300
  - Click Record

- [ ] **View Receipt**: 
  - Navigate to parent fee portal
  - View receipt for fee with food items
  - Should display:
    - Tuition: KSH 5000
    - Maize (×2): KSH 1000
    - Beans (×1): KSH 300
    - Total: KSH 6300

- [ ] **Delete Food Item**:
  - Try deleting a food item currently not used in any fees
  - Should succeed
  - Try deleting after adding to receipts (verify it still works)

---

## 🔍 Important Code Locations

| Feature | File | Line | Description |
|---------|------|------|-------------|
| ClassTeacher restriction | `src/App.tsx` | ~2246 | Dashboard locked to `teacherInfo.classes[0]` |
| ExamsManagement restriction | `src/App.tsx` | ~4700 | Class selection read-only for teachers |
| Class promotion sync | `pages/api/students/[...slug].ts` | ~13 | Updates teacher.classes on promotion |
| Food items API | `pages/api/finance/food-items.ts` | N/A | CRUD for food items |
| Fee recording | `src/App.tsx` | ~4050 | Submits tuition + food items to /api/fees |
| Receipt display | `pages/api/finance/receipt.ts` | ~200 | Shows food items breakdown |

---

## 🚀 Deployment Steps

1. **Backup your Supabase database** (recommended)

2. **Execute SQL migrations** in Supabase SQL Editor:
   - Run: `migrations/001_create_food_items_table.sql`
   - Run: `migrations/002_add_food_items_to_fees.sql`

3. **Deploy code changes**:
   - Files modified: `src/App.tsx`, `pages/api/students/[...slug].ts`, `pages/api/finance/receipt.ts`
   - Files created: `pages/api/finance/food-items.ts`

4. **Test thoroughly** using checklist above

5. **Verify in production**:
   - Test teacher login and class restriction
   - Create some test food items
   - Record fees with food items
   - View parent receipts

---

## 📝 Food Items Structure

When food items are submitted with a fee, the `food_items` JSONB object looks like:

```json
{
  "Maize": {
    "quantity": 2,
    "unit_price": 500,
    "total": 1000
  },
  "Beans": {
    "quantity": 1,
    "unit_price": 300,
    "total": 300
  }
}
```

This allows the receipt to reconstruct the breakdown even if food items are deleted later.

---

## ⚠️ Important Notes

1. **Teacher Class Assignments**: 
   - A teacher is now LOCKED to their first assigned class as ClassTeacher
   - They can still teach other subjects in other classes, but ClassTeacher dashboard is restricted
   - Class promotions automatically update their assignment

2. **Food Items are Optional**:
   - Fees can be recorded with tuition only (food items can be left blank)
   - Food items are stored as JSON for flexibility
   - Receipts show both tuition and food items if applicable

3. **Database Constraints**:
   - Food item names must be UNIQUE
   - Unit prices must be positive (>0)
   - Fees automatically store food_items as JSONB

4. **Security**:
   - Only headteachers can create/modify/delete food items
   - Only headteachers can modify fees
   - Teachers can only view their assigned class data
   - Row-level security (RLS) is enforced on all tables

---

## 🆘 Troubleshooting

**Issue**: "food_items table not found" error
- **Solution**: Execute `migrations/001_create_food_items_table.sql` in Supabase

**Issue**: "Column 'food_items' does not exist" on fees
- **Solution**: Execute `migrations/002_add_food_items_to_fees.sql` in Supabase

**Issue**: Teacher can see multiple classes
- **Solution**: Verify teacher has only ONE entry in `teachers.classes` array as ClassTeacher

**Issue**: Food items not showing in receipts
- **Solution**: Verify `food_items` column exists in fees table and contains proper JSON

**Issue**: Class promotion not updating teacher assignment
- **Solution**: Check that teacher.classes contains the old class name exactly as stored

---

## ✨ Next Steps (Future Enhancements)

1. Add food items to bulk fee imports
2. Add food items price tracking/history
3. Generate food items consumption reports per student
4. Add dietary preference tags to food items
5. Create food items inventory management
