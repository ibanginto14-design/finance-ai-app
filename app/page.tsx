"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Wallet,
  Sparkles,
  Target,
  CreditCard,
  TrendingUp,
  Bot,
  ShieldAlert,
  PiggyBank,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  PlusCircle,
} from "lucide-react";

const transactionsSeed = [
  { id: 1, date: "2026-03-01", merchant: "Mercadona", amount: -63.2, category: "Food" },
  { id: 2, date: "2026-03-02", merchant: "Renfe", amount: -24.9, category: "Transport" },
  { id: 3, date: "2026-03-02", merchant: "Spotify", amount: -10.99, category: "Subscriptions" },
  { id: 4, date: "2026-03-03", merchant: "Salary", amount: 2150, category: "Income" },
  { id: 5, date: "2026-03-04", merchant: "Zara", amount: -79.95, category: "Shopping" },
  { id: 6, date: "2026-03-04", merchant: "Repsol", amount: -55.1, category: "Transport" },
  { id: 7, date: "2026-03-05", merchant: "Netflix", amount: -13.99, category: "Subscriptions" },
  { id: 8, date: "2026-03-05", merchant: "Alquiler", amount: -780, category: "Housing" },
  { id: 9, date: "2026-03-06", merchant: "Farmacia", amount: -18.4, category: "Health" },
  { id: 10, date: "2026-03-06", merchant: "Amazon", amount: -129.0, category: "Shopping" },
  { id: 11, date: "2026-03-07", merchant: "Glovo", amount: -31.5, category: "Food" },
  { id: 12, date: "2026-03-08", merchant: "Bizum amigo", amount: -20.0, category: "Transfers" },
  { id: 13, date: "2026-03-08", merchant: "Electricidad", amount: -71.3, category: "Bills" },
  { id: 14, date: "2026-03-09", merchant: "Freelance", amount: 340, category: "Income" },
  { id: 15, date: "2026-03-10", merchant: "Uber", amount: -17.45, category: "Transport" },
];

const monthlyTrend = [
  { month: "Oct", income: 2400, spending: 1760 },
  { month: "Nov", income: 2310, spending: 1820 },
  { month: "Dec", income: 2630, spending: 2240 },
  { month: "Jan", income: 2190, spending: 1715 },
  { month: "Feb", income: 2325, spending: 1890 },
  { month: "Mar", income: 2490, spending: 1315 },
];

const budgets = {
  Food: 300,
  Transport: 120,
  Shopping: 180,
  Subscriptions: 35,
  Housing: 800,
  Bills: 120,
  Health: 80,
};

const goalsSeed = [
  { id: 1, name: "Emergency fund", current: 2400, target: 6000, monthlyContribution: 250 },
  { id: 2, name: "Trip to Poland", current: 420, target: 1200, monthlyContribution: 130 },
  { id: 3, name: "New laptop", current: 300, target: 1500, monthlyContribution: 100 },
];

const piePalette = ["#111827", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"];

function classifyMerchant(merchant: string) {
  const m = merchant.toLowerCase();
  if (["mercadona", "glovo", "supermercado"].some((x) => m.includes(x))) return "Food";
  if (["renfe", "uber", "repsol", "gasolina"].some((x) => m.includes(x))) return "Transport";
  if (["spotify", "netflix"].some((x) => m.includes(x))) return "Subscriptions";
  if (["amazon", "zara", "decathlon"].some((x) => m.includes(x))) return "Shopping";
  if (["alquiler"].some((x) => m.includes(x))) return "Housing";
  if (["electricidad", "agua", "internet"].some((x) => m.includes(x))) return "Bills";
  if (["farmacia"].some((x) => m.includes(x))) return "Health";
  if (["salary", "freelance", "nómina", "nomina"].some((x) => m.includes(x))) return "Income";
  return "Other";
}

function money(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function buildAssistantReply(question: string, context: any) {
  const q = question.toLowerCase();
  const { totalIncome, totalExpenses, balance, biggestCategory, suspicious, subscriptions, goals } = context;

  if (q.includes("presupuesto") || q.includes("budget")) {
    return `Este mes has ingresado ${money(totalIncome)} y gastado ${money(totalExpenses)}. Tu balance actual es ${money(balance)}. La categoría con más gasto es ${biggestCategory?.name || "N/A"} con ${money(biggestCategory?.value || 0)}.`;
  }
  if (q.includes("suscrip") || q.includes("subscription")) {
    return `He detectado ${subscriptions.length} suscripciones activas (${subscriptions.map((s: any) => s.merchant).join(", ")}). El coste conjunto estimado es ${money(subscriptions.reduce((a: number, b: any) => a + Math.abs(b.amount), 0))} al mes.`;
  }
  if (q.includes("ahorro") || q.includes("save") || q.includes("goal") || q.includes("meta")) {
    const fastest = [...goals].sort((a, b) => (a.target - a.current) / a.monthlyContribution - (b.target - b.current) / b.monthlyContribution)[0];
    return `Vas mejor encaminado en “${fastest.name}”. Manteniendo ${money(fastest.monthlyContribution)} al mes, alcanzarías la meta en aproximadamente ${Math.ceil((fastest.target - fastest.current) / fastest.monthlyContribution)} meses.`;
  }
  if (q.includes("fraude") || q.includes("fraud") || q.includes("raro") || q.includes("alerta")) {
    return suspicious.length
      ? `He marcado ${suspicious.length} movimientos para revisar: ${suspicious.map((t: any) => `${t.merchant} (${money(Math.abs(t.amount))})`).join(", ")}. No significa fraude seguro, pero sí transacciones fuera de tu patrón habitual.`
      : "No veo transacciones claramente anómalas en este conjunto de datos.";
  }
  return `Puedo ayudarte con presupuesto, suscripciones, metas de ahorro y alertas. Ahora mismo tu saldo neto del mes es ${money(balance)} y tu mayor foco de gasto está en ${biggestCategory?.name || "gastos generales"}.`;
}

type Transaction = {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  category: string;
};

type Goal = {
  id: number;
  name: string;
  current: number;
  target: number;
  monthlyContribution: number;
};

export default function AIFinanceMVP() {
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsSeed);
  const [goals, setGoals] = useState<Goal[]>(goalsSeed);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [txDate, setTxDate] = useState("2026-03-10");
  const [question, setQuestion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [goalName, setGoalName] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalMonthly, setGoalMonthly] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hola. Soy tu coach financiero. Puedo resumir tu presupuesto, detectar suscripciones, señalar gastos anómalos y sugerir cómo llegar antes a tus metas.",
    },
  ]);

  const stats = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.amount > 0).reduce((a, b) => a + b.amount, 0);
    const totalExpenses = Math.abs(transactions.filter((t) => t.amount < 0).reduce((a, b) => a + b.amount, 0));
    const balance = totalIncome - totalExpenses;

    const byCategoryMap = new Map<string, number>();
    transactions.filter((t) => t.amount < 0).forEach((t) => {
      const key = t.category;
      byCategoryMap.set(key, (byCategoryMap.get(key) || 0) + Math.abs(t.amount));
    });

    const byCategory = Array.from(byCategoryMap.entries()).map(([name, value]) => ({ name, value }));
    const biggestCategory = byCategory.slice().sort((a, b) => b.value - a.value)[0];

    const suspicious = transactions.filter((t) => t.amount < 0).filter((t) => {
      const abs = Math.abs(t.amount);
      return abs > 120 || t.merchant.toLowerCase().includes("amazon");
    });

    const subscriptions = transactions.filter((t) => t.category === "Subscriptions");

    const forecast = [
      { name: "Current", value: balance },
      { name: "+ 30 days", value: balance + 280 },
      { name: "+ 60 days", value: balance + 520 },
      { name: "+ 90 days", value: balance + 810 },
    ];

    const budgetStatus = Object.entries(budgets).map(([name, limit]) => {
      const spent = byCategory.find((c) => c.name === name)?.value || 0;
      return {
        name,
        limit,
        spent,
        progress: Math.min(100, Math.round((spent / limit) * 100)),
        over: spent > limit,
      };
    });

    return { totalIncome, totalExpenses, balance, byCategory, biggestCategory, suspicious, subscriptions, forecast, budgetStatus };
  }, [transactions]);

  const resetTransactionForm = () => {
    setMerchant("");
    setAmount("");
    setTxDate("2026-03-10");
    setEditingId(null);
  };

  const addOrUpdateTransaction = () => {
    const numeric = Number(amount);
    if (!merchant.trim() || Number.isNaN(numeric) || numeric === 0 || !txDate) return;
    const category = classifyMerchant(merchant);

    if (editingId !== null) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, merchant: merchant.trim(), amount: numeric, date: txDate, category }
            : t
        )
      );
    } else {
      const next = {
        id: Date.now(),
        date: txDate,
        merchant: merchant.trim(),
        amount: numeric,
        category,
      };
      setTransactions((prev) => [next, ...prev]);
    }

    resetTransactionForm();
  };

  const startEditTransaction = (tx: Transaction) => {
    setMerchant(tx.merchant);
    setAmount(String(tx.amount));
    setTxDate(tx.date);
    setEditingId(tx.id);
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) resetTransactionForm();
  };

  const resetGoalForm = () => {
    setGoalName("");
    setGoalCurrent("");
    setGoalTarget("");
    setGoalMonthly("");
    setEditingGoalId(null);
  };

  const addOrUpdateGoal = () => {
    const current = Number(goalCurrent);
    const target = Number(goalTarget);
    const monthlyContribution = Number(goalMonthly);

    if (!goalName.trim() || Number.isNaN(current) || Number.isNaN(target) || Number.isNaN(monthlyContribution) || target <= 0 || monthlyContribution <= 0) return;

    if (editingGoalId !== null) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoalId
            ? { ...g, name: goalName.trim(), current, target, monthlyContribution }
            : g
        )
      );
    } else {
      const nextGoal = {
        id: Date.now(),
        name: goalName.trim(),
        current,
        target,
        monthlyContribution,
      };
      setGoals((prev) => [...prev, nextGoal]);
    }

    resetGoalForm();
  };

  const startEditGoal = (goal: Goal) => {
    setGoalName(goal.name);
    setGoalCurrent(String(goal.current));
    setGoalTarget(String(goal.target));
    setGoalMonthly(String(goal.monthlyContribution));
    setEditingGoalId(goal.id);
  };

  const deleteGoal = (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editingGoalId === id) resetGoalForm();
  };

  const askAssistant = () => {
    if (!question.trim()) return;
    const userMessage = { role: "user", content: question };
    const assistantMessage = {
      role: "assistant",
      content: buildAssistantReply(question, { ...stats, goals }),
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setQuestion("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]"
        >
          <Card className="rounded-3xl border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    <Sparkles className="h-4 w-4" /> AI-driven personal finance MVP
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight md:text-5xl">MoneyPilot AI</h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                    Ahora puedes editar tus movimientos y metas directamente desde la app, sin tocar el código.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <KPI icon={Wallet} label="Balance" value={money(stats.balance)} />
                  <KPI icon={TrendingUp} label="Ingresos" value={money(stats.totalIncome)} />
                  <KPI icon={CreditCard} label="Gastos" value={money(stats.totalExpenses)} />
                  <KPI icon={PiggyBank} label="Suscripciones" value={String(stats.subscriptions.length)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5" /> Asistente financiero</CardTitle>
              <CardDescription>Consulta tu situación con lenguaje natural.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[240px] rounded-2xl bg-slate-50 p-3">
                <div className="space-y-3">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${m.role === "assistant" ? "bg-white shadow ml-0" : "bg-slate-900 text-white ml-auto"}`}>
                      {m.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ej.: ¿Cómo va mi presupuesto?" />
                <Button onClick={askAssistant}>Preguntar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "¿Cómo va mi presupuesto?",
                  "¿Qué suscripciones tengo?",
                  "¿Hay algún gasto raro?",
                  "¿Qué meta alcanzaré antes?",
                ].map((q) => (
                  <Button key={q} variant="outline" className="rounded-full" onClick={() => setQuestion(q)}>{q}</Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & AI</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Tendencia mensual</CardTitle>
                  <CardDescription>Ingreso vs gasto de los últimos meses.</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <defs>
                        <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => money(Number(value))} />
                      <Legend />
                      <Area type="monotone" dataKey="income" name="Ingresos" fill="url(#incomeFill)" stroke="currentColor" />
                      <Area type="monotone" dataKey="spending" name="Gastos" fill="url(#spendFill)" stroke="currentColor" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Gasto por categoría</CardTitle>
                  <CardDescription>Categorización automática de movimientos.</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.byCategory} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60}>
                        {stats.byCategory.map((entry, index) => (
                          <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => money(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Presupuesto inteligente</CardTitle>
                  <CardDescription>Comparación entre límite mensual y gasto real.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.budgetStatus.map((item) => (
                    <div key={item.name} className="rounded-2xl border bg-white p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>{money(item.spent)} / {money(item.limit)}</span>
                          {item.over ? <Badge variant="destructive">Excedido</Badge> : <Badge variant="secondary">OK</Badge>}
                        </div>
                      </div>
                      <Progress value={item.progress} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Predicción de caja</CardTitle>
                  <CardDescription>Simulación simple a 30/60/90 días.</CardDescription>
                </CardHeader>
                <CardContent className="h-[330px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => money(Number(value))} />
                      <Bar dataKey="value" name="Saldo proyectado" radius={[12, 12, 0, 0]} fill="currentColor" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.2fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{editingId !== null ? "Editar movimiento" : "Añadir movimiento"}</CardTitle>
                  <CardDescription>Puedes crear, editar y borrar movimientos desde aquí.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha</label>
                    <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comercio</label>
                    <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Ej.: Decathlon o Nómina" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Importe</label>
                    <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Usa negativo para gasto y positivo para ingreso" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={addOrUpdateTransaction}>{editingId !== null ? "Guardar cambios" : "Añadir movimiento"}</Button>
                    {editingId !== null && <Button variant="outline" onClick={resetTransactionForm}>Cancelar</Button>}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    Ejemplos: <span className="font-medium">Mercadona -35.90</span>, <span className="font-medium">Nómina 2100</span>, <span className="font-medium">Netflix -13.99</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Últimos movimientos</CardTitle>
                  <CardDescription>Feed transaccional editable en tiempo real.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    <Search className="h-4 w-4" /> Edita o borra cualquier línea con los iconos de la derecha.
                  </div>
                  <div className="space-y-3">
                    {transactions.map((t) => (
                      <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-2xl border bg-white p-4 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`rounded-2xl p-2 ${t.amount > 0 ? "bg-emerald-100" : "bg-slate-100"}`}>
                            {t.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{t.merchant}</div>
                            <div className="text-sm text-slate-500">{t.date} · {t.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className={`font-semibold ${t.amount > 0 ? "text-emerald-700" : "text-slate-900"}`}>{money(t.amount)}</div>
                          <Button size="icon" variant="outline" onClick={() => startEditTransaction(t)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="outline" onClick={() => deleteTransaction(t.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{editingGoalId !== null ? "Editar meta" : "Añadir meta"}</CardTitle>
                  <CardDescription>Modifica tus objetivos sin tocar el código.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <Input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Ej.: Fondo de emergencia" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ahorrado actual</label>
                    <Input value={goalCurrent} onChange={(e) => setGoalCurrent(e.target.value)} placeholder="Ej.: 1200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Objetivo total</label>
                    <Input value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="Ej.: 5000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aportación mensual</label>
                    <Input value={goalMonthly} onChange={(e) => setGoalMonthly(e.target.value)} placeholder="Ej.: 200" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={addOrUpdateGoal}>{editingGoalId !== null ? "Guardar cambios" : "Añadir meta"}</Button>
                    {editingGoalId !== null && <Button variant="outline" onClick={resetGoalForm}>Cancelar</Button>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Metas financieras</CardTitle>
                  <CardDescription>Puedes editar o borrar cualquier meta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal) => {
                    const pct = Math.round((goal.current / goal.target) * 100);
                    const monthsLeft = Math.max(0, Math.ceil((goal.target - goal.current) / goal.monthlyContribution));
                    return (
                      <div key={goal.id} className="rounded-2xl border bg-white p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{goal.name}</div>
                            <div className="text-sm text-slate-500">{money(goal.current)} de {money(goal.target)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{monthsLeft} meses</Badge>
                            <Button size="icon" variant="outline" onClick={() => startEditGoal(goal)}><Pencil className="h-4 w-4" /></Button>
                            <Button size="icon" variant="outline" onClick={() => deleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <Progress value={pct} />
                        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                          <span>Aportación mensual: {money(goal.monthlyContribution)}</span>
                          <span>{pct}% completado</span>
                        </div>
                      </div>
                    );
                  })}
                  {!goals.length && (
                    <div className="rounded-2xl border border-dashed bg-white p-5 text-sm text-slate-500 flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" /> No hay metas todavía.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recomendaciones de ahorro</CardTitle>
                <CardDescription>Nudges automáticos basados en tus datos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 ? (
                  <>
                    <Insight icon={Target} title="Meta más cercana" text={`"${[...goals].sort((a, b) => (a.target - a.current) / a.monthlyContribution - (b.target - b.current) / b.monthlyContribution)[0].name}" es la más rápida de alcanzar con el ritmo actual.`} />
                    <Insight icon={PiggyBank} title="Potencial de ahorro" text={`Reduciendo compras en Shopping un 20%, liberarías aproximadamente ${money((stats.byCategory.find((c) => c.name === "Shopping")?.value || 0) * 0.2)} al mes.`} />
                    <Insight icon={Sparkles} title="Automatización sugerida" text="Programa transferencias el día posterior a cada ingreso para separar ahorro antes de gastar." />
                  </>
                ) : (
                  <div className="rounded-2xl border bg-white p-4 text-sm text-slate-500">Añade al menos una meta para recibir recomendaciones personalizadas.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Alertas y anomalías</CardTitle>
                  <CardDescription>Detección simple de transacciones fuera del patrón.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.suspicious.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <ShieldAlert className="mt-0.5 h-5 w-5" />
                      <div>
                        <div className="font-medium">Revisar: {t.merchant}</div>
                        <div className="text-sm text-slate-700">Movimiento de {money(Math.abs(t.amount))} detectado como gasto inusual respecto al patrón actual.</div>
                      </div>
                    </div>
                  ))}
                  {!stats.suspicious.length && <div className="rounded-2xl border bg-white p-4">No hay alertas importantes.</div>}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Hoja de ruta MVP → producto real</CardTitle>
                  <CardDescription>Cómo convertir este prototipo en una app lista para producción.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                  <RoadmapStep n="1" title="Conectar cuentas" text="Integra una API bancaria/agregador y mueve los datos a un backend seguro." />
                  <RoadmapStep n="2" title="Persistencia y auth" text="Añade autenticación, base de datos y perfiles de usuario con Supabase, Firebase o tu stack preferido." />
                  <RoadmapStep n="3" title="IA real" text="Sustituye las reglas locales por clasificación ML/NLP, forecasting y un copiloto LLM con herramientas sobre tus datos financieros." />
                  <RoadmapStep n="4" title="Compliance" text="Implementa cifrado, registros de auditoría, consentimiento explícito y revisión legal/PSD2/GDPR según región." />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />
        <div className="grid gap-4 md:grid-cols-3">
          <FooterCard title="Editable desde la UI" text="Ya no necesitas tocar arrays en el código para cambiar movimientos o metas." />
          <FooterCard title="Siguiente mejora" text="El siguiente paso ideal es guardar cambios en localStorage o base de datos." />
          <FooterCard title="Preparada para crecer" text="La estructura ya está lista para conectar backend y persistencia." />
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-slate-500"><Icon className="h-4 w-4" /> <span className="text-xs uppercase tracking-wide">{label}</span></div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Insight({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 flex items-center gap-2 font-medium"><Icon className="h-4 w-4" /> {title}</div>
      <div className="text-sm text-slate-600">{text}</div>
    </div>
  );
}

function RoadmapStep({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-1 flex items-center gap-2 font-medium">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">{n}</span>
        {title}
      </div>
      <div className="text-slate-600">{text}</div>
    </div>
  );
}

function FooterCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="rounded-3xl border-0 shadow-md">
      <CardContent className="p-5">
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{text}</div>
      </CardContent>
    </Card>
  );
}
