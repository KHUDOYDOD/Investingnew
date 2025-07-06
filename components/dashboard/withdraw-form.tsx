"use client"

import React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  Wallet,
  Bitcoin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

/* -------------------------------------------------------------------------- */
/*                                MOCK CONFIG                                 */
/* -------------------------------------------------------------------------- */

const withdrawMethods = [
  {
    id: "card",
    name: "Банковская карта",
    description: "Visa, MasterCard, Мир",
    icon: <CreditCard className="h-6 w-6" />,
    fee: "2%",
    time: "1-3 рабочих дня",
    minAmount: 50,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
  },
  {
    id: "crypto",
    name: "Криптовалюта",
    description: "Bitcoin, Ethereum, USDT",
    icon: <Bitcoin className="h-6 w-6" />,
    fee: "1%",
    time: "30-60 минут",
    minAmount: 25,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    id: "ewallet",
    name: "Электронные кошельки",
    description: "Qiwi, WebMoney, ЮMoney",
    icon: <Wallet className="h-6 w-6" />,
    fee: "3%",
    time: "2-6 часов",
    minAmount: 30,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
  },
]

/* -------------------------------------------------------------------------- */
/*                               COMPONENT BODY                               */
/* -------------------------------------------------------------------------- */

export interface WithdrawFormProps {
  balance: number
}

export default function WithdrawForm({ balance = 0 }: WithdrawFormProps) {
  const [amount, setAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState<string>("")
  const [walletAddress, setWalletAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")
  const [paymentDetails, setPaymentDetails] = useState("")

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const { toast } = useToast()

  const selectedMethod = withdrawMethods.find((m) => m.id === withdrawMethod)
  const withdrawAmount = Number.parseFloat(amount) || 0
  const feeAmount = selectedMethod ? (withdrawAmount * Number.parseFloat(selectedMethod.fee.replace("%", ""))) / 100 : 0
  const finalAmount = withdrawAmount - feeAmount

  const next = () => {
    setError("")
    if (step === 1 && (withdrawAmount <= 0 || withdrawAmount > balance)) {
      setError("Введите корректную сумму")
      return
    }

    if (step === 2 && !withdrawMethod) {
      setError("Выберите способ вывода")
      return
    }

    if (step === 3) {
      if (!walletAddress.trim()) {
        setError("Введите реквизиты")
        return
      }
      if (withdrawMethod === "crypto" && !cryptoNetwork.trim()) {
        setError("Укажите сеть")
        return
      }
    }

    setStep((s) => s + 1)
  }

  const back = () => {
    setError("")
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          payment_method: withdrawMethod,
          payment_details: paymentDetails,
        }),
      })

      if (!res.ok) throw new Error("Ошибка")

      setSuccess(true)
      toast({ title: "Withdrawal requested", description: `Amount: $${withdrawAmount.toFixed(2)}` })
      setTimeout(() => {
        // reset for demo
        setAmount("")
        setWithdrawMethod("")
        setWalletAddress("")
        setCryptoNetwork("")
        setStep(1)
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                               RENDER MARKUP                              */
  /* ------------------------------------------------------------------------ */

  /* Success screen --------------------------------------------------------- */
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 py-12 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>

        <div>
          <h3 className="mb-2 text-2xl font-bold text-white">Заявка создана!</h3>
          <p className="text-emerald-200">
            Запрос на вывод <span className="font-semibold text-emerald-400">${withdrawAmount.toFixed(2)}</span>{" "}
            отправлен.
          </p>
          <p className="mt-2 text-sm text-emerald-300">Средства будут переведены после подтверждения администратором</p>
        </div>
      </motion.div>
    )
  }

  /* Common error alert ----------------------------------------------------- */
  const ErrorAlert = () =>
    error ? (
      <Alert variant="destructive" className="bg-red-500/10 pb-4 text-sm text-red-300">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    ) : null

  /* ------------------------------------------------------------------------ */
  /*                               STEP RENDERING                             */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-8">
      {/* ------------ Balance card ------------ */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="mb-2 flex items-center justify-center space-x-2">
            <DollarSign className="h-6 w-6 text-emerald-400" />
            <h4 className="font-medium text-emerald-400">Доступный баланс</h4>
          </div>
          <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
          <p className="mt-2 text-emerald-300">Готово к выводу</p>
        </CardContent>
      </Card>

      {/* ------------ Progress dots ------------ */}
      <div className="mb-8 flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((n) => (
          <React.Fragment key={n}>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                step >= n ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "bg-white/10 text-white/50"
              }`}
            >
              {n}
            </div>
            {n < 4 && (
              <div
                className={`h-1 w-12 rounded transition ${
                  step > n ? "bg-gradient-to-r from-emerald-500 to-teal-600" : "bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ------------ Error alert ------------ */}
      <ErrorAlert />

      {/* ==================== STEP 1 ==================== */}
      {step === 1 && (
        <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Сумма для вывода</h3>
            <p className="text-white/70">Введите сумму, которую хотите вывести</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-lg font-medium text-white">
                Сумма
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/50">$</span>
                <Input
                  id="amount"
                  type="number"
                  min={10}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="h-14 bg-white/10 pl-8 text-lg text-white placeholder:text-white/50 focus:border-emerald-400"
                />
              </div>
              <p className="text-sm text-white/60">
                Доступно: <span className="font-medium text-emerald-400">${balance.toFixed(2)}</span>
              </p>
            </div>

            {/* Quick-amount buttons */}
            <div className="grid grid-cols-4 gap-3">
              {[25, 50, 100, 250].map((v) => (
                <Button
                  key={v}
                  variant="outline"
                  className={`h-12 border-white/20 text-white hover:bg-white/10 ${
                    amount === v.toString() ? "bg-gradient-to-r from-emerald-500 to-teal-600" : ""
                  }`}
                  onClick={() => setAmount(v.toString())}
                  disabled={v > balance}
                  type="button"
                >
                  ${v}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              className="h-12 w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => setAmount(balance.toString())}
              type="button"
            >
              Вывести весь баланс (${balance.toFixed(2)})
            </Button>
          </div>

          <Button
            className="h-12 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            onClick={next}
            disabled={withdrawAmount <= 0 || withdrawAmount > balance}
            type="button"
          >
            Продолжить
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* ==================== STEP 2 ==================== */}
      {step === 2 && (
        <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Способ вывода</h3>
            <p className="text-white/70">
              Сумма: <span className="font-semibold text-emerald-400">${withdrawAmount.toFixed(2)}</span>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {withdrawMethods.map((m) => {
              const disabled = withdrawAmount < m.minAmount
              return (
                <Card
                  key={m.id}
                  onClick={() => !disabled && setWithdrawMethod(m.id)}
                  className={`relative cursor-pointer transition hover:scale-105 ${
                    withdrawMethod === m.id
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${m.bgGradient} opacity-50`} />
                  <CardContent className="relative space-y-4 p-6 text-center">
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${m.gradient} text-white`}
                    >
                      {m.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{m.name}</h4>
                      <p className="text-sm text-white/70">{m.description}</p>
                    </div>
                    <div className="space-y-1 text-sm text-white/80">
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span>{m.time}</span>
                      </div>
                      <span className="text-yellow-400 font-medium">Комиссия: {m.fee}</span>
                      <div className="text-xs text-white/60">Мин. сумма: ${m.minAmount}</div>
                      {disabled && <div className="text-xs font-medium text-red-400">Недостаточная сумма</div>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={back}
              type="button"
            >
              Назад
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              onClick={next}
              disabled={!withdrawMethod}
              type="button"
            >
              Продолжить
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ==================== STEP 3 ==================== */}
      {step === 3 && selectedMethod && (
        <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Реквизиты</h3>
            <p className="text-white/70">Введите данные для {selectedMethod.name.toLowerCase()}</p>
          </div>

          <div className="space-y-4">
            {/* wallet / card / e-wallet */}
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-lg text-white">
                {withdrawMethod === "card"
                  ? "Номер карты"
                  : withdrawMethod === "crypto"
                    ? "Адрес кошелька"
                    : "Номер кошелька"}
              </Label>
              <Input
                id="wallet"
                value={walletAddress}
                onChange={(e) => {
                  setWalletAddress(e.target.value)
                  setPaymentDetails(e.target.value)
                }}
                placeholder={
                  withdrawMethod === "card"
                    ? "1234 5678 9012 3456"
                    : withdrawMethod === "crypto"
                      ? "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      : "R123456789"
                }
                className="h-12 bg-white/10 text-white placeholder:text-white/50 focus:border-emerald-400"
              />
            </div>

            {/* crypto network ------------------------------------------------ */}
            {withdrawMethod === "crypto" && (
              <div className="space-y-2">
                <Label htmlFor="network" className="text-lg text-white">
                  Сеть
                </Label>
                <Input
                  id="network"
                  placeholder="Ethereum (ERC-20)"
                  value={cryptoNetwork}
                  onChange={(e) => setCryptoNetwork(e.target.value)}
                  className="h-12 bg-white/10 text-white placeholder:text-white/50 focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={back}
              type="button"
            >
              Назад
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              onClick={next}
              disabled={!walletAddress.trim() || (withdrawMethod === "crypto" && !cryptoNetwork.trim())}
              type="button"
            >
              Продолжить
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ==================== STEP 4 ==================== */}
      {step === 4 && selectedMethod && (
        <motion.form
          key="step-4"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Подтверждение</h3>
            <p className="text-white/70">Проверьте данные и отправьте заявку</p>
          </div>

          {/* summary card --------------------------------------------------- */}
          <Card className="border-white/20 bg-white/10 shadow-xl backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Детали
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 text-sm text-white">
              <div className="flex justify-between">
                <span className="text-white/70">Метод:</span>
                <span className="flex items-center space-x-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-r ${selectedMethod.gradient}`}
                  >
                    {selectedMethod.icon}
                  </div>
                  <span>{selectedMethod.name}</span>
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/70">Реквизиты:</span>
                <span className="font-mono">
                  {walletAddress.length > 18 ? `${walletAddress.slice(0, 18)}…` : walletAddress}
                </span>
              </div>

              {selectedMethod.id === "crypto" && (
                <div className="flex justify-between">
                  <span className="text-white/70">Сеть:</span>
                  <span className="font-mono">{cryptoNetwork}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-white/70">Сумма:</span>
                <span>${withdrawAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Комиссия ({selectedMethod.fee}):</span>
                <span className="text-red-400">-${feeAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/20 pt-4 text-lg font-semibold">
                <div className="flex justify-between">
                  <span>К получению:</span>
                  <span className="text-emerald-400">${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-yellow-500/20 text-yellow-200">
            <Clock className="h-4 w-4" />
            <AlertDescription>Перевод производится администратором в течение 24 часов.</AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 h-12 border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={back}
              type="button"
            >
              Назад
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Создание…
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Создать заявку
                </>
              )}
            </Button>
          </div>
        </motion.form>
      )}
    </div>
  )
}
