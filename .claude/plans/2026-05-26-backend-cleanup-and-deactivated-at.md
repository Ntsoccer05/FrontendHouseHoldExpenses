# Backend Cleanup & deactivated_at Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** monthly_amounts テーブルを削除し、fixed_expenses テーブルから SoftDeletes を廃止して deactivated_at カラムを追加、1年以上無効のレコードをバッチ削除するコマンドを追加する。

**Architecture:** マイグレーションでスキーマ変更、モデル・コントローラーを更新、Artisan コマンドを新規作成してスケジューラーに登録する。余計なソース残存を grep でチェックする。

**Tech Stack:** Laravel 10, PHP, Artisan Console Commands

**Working directory:** `C:\WorkSpace\HouseHoldExpenses\src`

---

### Task 1: monthly_amounts 削除マイグレーション作成

**Files:**
- Create: `database/migrations/[timestamp]_drop_monthly_amounts_table.php`

- [ ] **Step 1: マイグレーションファイルを作成する**

```bash
php artisan make:migration drop_monthly_amounts_table
```

- [ ] **Step 2: 生成されたファイルを以下の内容で書き換える**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('monthly_amounts');
    }

    public function down(): void
    {
        Schema::create('monthly_amounts', function ($table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('amount');
            $table->dateTime('recorded_at');
            $table->timestamps();
        });
    }
};
```

- [ ] **Step 3: マイグレーションを実行する**

```bash
php artisan migrate
```

Expected: `Migrating: ..._drop_monthly_amounts_table` → `Migrated`

---

### Task 2: monthly_amounts 関連ファイルを削除する

**Files:**
- Delete: `app/Models/MonthlyAmount.php`
- Delete: `app/Filament/Resources/MonthlyAmountResource.php`
- Delete: `app/Filament/Resources/MonthlyAmountResource/Pages/ListMonthlyAmounts.php`
- Delete: `app/Filament/Resources/MonthlyAmountResource/Pages/CreateMonthlyAmount.php`
- Delete: `app/Filament/Resources/MonthlyAmountResource/Pages/EditMonthlyAmount.php`
- Delete: `database/factories/MonthlyAmountFactory.php`
- Modify: `app/Models/User.php`

- [ ] **Step 1: 6ファイルを削除する**

```bash
rm app/Models/MonthlyAmount.php
rm app/Filament/Resources/MonthlyAmountResource.php
rm app/Filament/Resources/MonthlyAmountResource/Pages/ListMonthlyAmounts.php
rm app/Filament/Resources/MonthlyAmountResource/Pages/CreateMonthlyAmount.php
rm app/Filament/Resources/MonthlyAmountResource/Pages/EditMonthlyAmount.php
rm database/factories/MonthlyAmountFactory.php
```

- [ ] **Step 2: `app/Models/User.php` から MonthlyAmounts リレーションを削除する**

現在の73〜76行目：
```php
public function MonthlyAmounts():HasMany
{
    return $this->hasMany(MonthlyAmount::class);
}
```
この4行を削除する。

---

### Task 3: monthly_amounts 残存参照チェック

**Files:**
- Check: `app/` および `database/` 配下全体

- [ ] **Step 1: monthly_amounts・MonthlyAmount への参照が残っていないか確認する**

```bash
grep -r "monthly_amounts\|MonthlyAmount" app/ database/ routes/ --include="*.php" -l
```

Expected: 出力なし（残存なし）

- [ ] **Step 2: 出力があった場合は該当箇所を確認して削除する**

出力がなければこのステップはスキップ。

---

### Task 4: fixed_expenses テーブル変更マイグレーション（SoftDeletes 廃止 + deactivated_at 追加）

**Files:**
- Create: `database/migrations/[timestamp]_update_fixed_expenses_remove_soft_deletes_add_deactivated_at.php`

- [ ] **Step 1: マイグレーションファイルを作成する**

```bash
php artisan make:migration update_fixed_expenses_remove_soft_deletes_add_deactivated_at --table=fixed_expenses
```

- [ ] **Step 2: 生成されたファイルを以下の内容で書き換える**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 論理削除済みレコードを物理削除してから deleted_at を除去
        \DB::table('fixed_expenses')->whereNotNull('deleted_at')->delete();

        Schema::table('fixed_expenses', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->timestamp('deactivated_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('fixed_expenses', function (Blueprint $table) {
            $table->dropColumn('deactivated_at');
            $table->softDeletes();
        });
    }
};
```

- [ ] **Step 3: マイグレーションを実行する**

```bash
php artisan migrate
```

Expected: `Migrating: ..._update_fixed_expenses_remove_soft_deletes_add_deactivated_at` → `Migrated`

---

### Task 5: FixedExpense モデルから SoftDeletes を除去し deactivated_at を追加

**Files:**
- Modify: `app/Models/FixedExpense.php`

- [ ] **Step 1: ファイル全体を以下に置き換える**

```php
<?php

namespace App\Models;

use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FixedExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type_id', 'category_id', 'amount',
        'content', 'fixed_expense_day', 'is_active', 'last_replicated_at', 'deactivated_at',
    ];

    protected $casts = [
        'is_active'           => 'boolean',
        'last_replicated_at'  => 'datetime',
        'deactivated_at'      => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculateExecutionDate(int $year, int $month): Carbon
    {
        $lastDay = Carbon::create($year, $month)->endOfMonth()->day;
        $day = min($this->fixed_expense_day, $lastDay);
        return Carbon::create($year, $month, $day);
    }

    public function isReplicatedForMonth(int $year, int $month): bool
    {
        $yearMonth = sprintf('%04d%02d', $year, $month);
        return Content::where('fixed_expense_id', $this->id)
            ->whereRaw('DATE_FORMAT(recorded_at, "%Y%m") = ?', [$yearMonth])
            ->exists();
    }

    public function replicateForMonth(int $year, int $month): ?Content
    {
        if ($this->isReplicatedForMonth($year, $month)) {
            return null;
        }
        $executionDate = $this->calculateExecutionDate($year, $month);
        $content = Content::create([
            'user_id'          => $this->user_id,
            'type_id'          => $this->type_id,
            'category_id'      => $this->category_id,
            'amount'           => $this->amount,
            'content'          => $this->content,
            'recorded_at'      => $executionDate,
            'is_fixed_expense' => true,
            'fixed_expense_id' => $this->id,
        ]);

        $this->update(['last_replicated_at' => now()]);

        return $content;
    }
}
```

---

### Task 6: FixedExpenseController を更新する（deleted_at 除去 + deactivated_at 自動セット）

**Files:**
- Modify: `app/Http/Controllers/FixedExpenseController.php`

- [ ] **Step 1: ファイル全体を以下に置き換える**

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFixedExpenseRequest;
use App\Http\Requests\UpdateFixedExpenseRequest;
use App\Models\FixedExpense;
use Illuminate\Http\Request;

class FixedExpenseController extends Controller
{
    public function index(Request $request)
    {
        $fixedExpenses = FixedExpense::where('user_id', $request->user()->id)
            ->orderBy('id')
            ->get()
            ->makeHidden(['user_id', 'last_replicated_at']);
        return response()->json(['status' => 200, 'fixedExpenses' => $fixedExpenses]);
    }

    private function resolveTypeId(string $type): int
    {
        return $type === 'income'
            ? config('app.income_type_id')
            : config('app.expense_type_id');
    }

    public function store(StoreFixedExpenseRequest $request)
    {
        $fixedExpense = new FixedExpense();
        $fixedExpense->user_id           = $request->user()->id;
        $fixedExpense->type_id           = $this->resolveTypeId($request->type);
        $fixedExpense->category_id       = $request->category_id;
        $fixedExpense->amount            = $request->amount;
        $fixedExpense->content           = $request->content;
        $fixedExpense->fixed_expense_day = $request->fixed_expense_day;
        $fixedExpense->save();
        return response()->json(['status' => 200, 'message' => '固定費を作成しました', 'fixedExpense' => $fixedExpense]);
    }

    public function update(UpdateFixedExpenseRequest $request, FixedExpense $fixedExpense)
    {
        if ($fixedExpense->user_id !== $request->user()->id) {
            return response()->json(['status' => 403, 'message' => '権限がありません'], 403);
        }

        $wasActive = (bool) $fixedExpense->is_active;

        $fixedExpense->fill($request->only(['category_id', 'amount', 'content', 'fixed_expense_day', 'is_active']));

        if ($request->has('type')) {
            $fixedExpense->type_id = $this->resolveTypeId($request->type);
        }

        // is_active が true → false になったとき deactivated_at を自動セット
        if ($wasActive && $request->has('is_active') && !$request->boolean('is_active')) {
            $fixedExpense->deactivated_at = now();
        }

        // is_active が false → true に戻ったとき deactivated_at をクリア
        if (!$wasActive && $request->has('is_active') && $request->boolean('is_active')) {
            $fixedExpense->deactivated_at = null;
        }

        $fixedExpense->save();
        return response()->json(['status' => 200, 'message' => '固定費を更新しました', 'fixedExpense' => $fixedExpense]);
    }

    public function destroy(Request $request, FixedExpense $fixedExpense)
    {
        if ($fixedExpense->user_id !== $request->user()->id) {
            return response()->json(['status' => 403, 'message' => '権限がありません'], 403);
        }
        $fixedExpense->delete();
        return response()->json(['status' => 200, 'message' => '固定費を削除しました']);
    }
}
```

---

### Task 7: CleanupFixedExpenses Artisan コマンドを作成する

**Files:**
- Create: `app/Console/Commands/CleanupFixedExpenses.php`

- [ ] **Step 1: ファイルを作成する**

```php
<?php

namespace App\Console\Commands;

use App\Models\FixedExpense;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupFixedExpenses extends Command
{
    protected $signature = 'fixed-expenses:cleanup';
    protected $description = '1年以上前に無効化された固定費を物理削除する';

    public function handle(): int
    {
        $threshold = Carbon::now()->subYear();

        $count = FixedExpense::where('is_active', false)
            ->where('deactivated_at', '<=', $threshold)
            ->count();

        FixedExpense::where('is_active', false)
            ->where('deactivated_at', '<=', $threshold)
            ->delete();

        $this->info("削除完了: {$count}件の無効固定費を物理削除しました");
        Log::info("fixed-expenses:cleanup: {$count}件削除");

        return Command::SUCCESS;
    }
}
```

- [ ] **Step 2: コマンドが認識されることを確認する**

```bash
php artisan list | grep fixed-expenses
```

Expected:
```
fixed-expenses:cleanup   1年以上前に無効化された固定費を物理削除する
fixed-expenses:replicate 固定費を当月分として複製する
```

---

### Task 8: スケジューラーに cleanup コマンドを登録する

**Files:**
- Modify: `app/Console/Kernel.php`

- [ ] **Step 1: Kernel.php の schedule メソッドを以下に置き換える**

```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('fixed-expenses:replicate')
        ->monthlyOn(1, '10:00')
        ->timezone('Asia/Tokyo')
        ->onOneServer();

    $schedule->command('fixed-expenses:cleanup')
        ->monthlyOn(1, '10:30')
        ->timezone('Asia/Tokyo')
        ->onOneServer();
}
```

---

### Task 9: SoftDeletes 残存参照チェック

**Files:**
- Check: `app/` および `database/` 配下全体

- [ ] **Step 1: fixed_expenses 関連で SoftDeletes・withTrashed・deleted_at の参照が残っていないか確認する**

```bash
grep -r "SoftDeletes\|withTrashed\|deleted_at\|restore()" app/ --include="*.php" -l
```

Expected: `app/Models/` 配下に他の SoftDeletes モデルがある場合はその一覧のみ（FixedExpense は含まれないこと）

- [ ] **Step 2: FixedExpense モデルで SoftDeletes が使われていないことを確認する**

```bash
grep "SoftDeletes\|withTrashed" app/Models/FixedExpense.php
```

Expected: 出力なし

---

### 最終コミット

- [ ] **全タスク完了後にコミット**

```bash
cd C:\WorkSpace\HouseHoldExpenses
git add -A
git commit -m "refactor: monthly_amounts削除・fixed_expenses SoftDeletes廃止・deactivated_at追加・クリーンアップバッチ追加"
```
