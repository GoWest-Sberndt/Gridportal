import React, { useState, useEffect } from "react";
import { Home, DollarSign } from "lucide-react";

interface MortgageCalculatorWidgetProps {
  className?: string;
}

export default function MortgageCalculatorWidget({
  className = "",
}: MortgageCalculatorWidgetProps) {
  const [loanAmount, setLoanAmount] = useState("400000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  const calculateMortgage = () => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const payments = (parseFloat(loanTerm) || 0) * 12;

    if (principal > 0 && rate > 0 && payments > 0) {
      const monthlyPaymentCalc =
        (principal * (rate * Math.pow(1 + rate, payments))) /
        (Math.pow(1 + rate, payments) - 1);
      const totalPaymentCalc = monthlyPaymentCalc * payments;
      const totalInterestCalc = totalPaymentCalc - principal;

      setMonthlyPayment(monthlyPaymentCalc);
      setTotalPayment(totalPaymentCalc);
      setTotalInterest(totalInterestCalc);
    } else {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setTotalInterest(0);
    }
  };

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={`bg-[#0b2a48] rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Home size={16} className="text-[#e7f0ff]" />
        <h3 className="text-[#e7f0ff] font-extrabold">Mortgage Calculator</h3>
      </div>

      {/* Input Fields */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[#d9e7ff] text-xs font-bold mb-1 block">
            Loan Amount
          </label>
          <div className="relative">
            <DollarSign
              size={14}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9db9dc]"
            />
            <input
              type="text"
              value={loanAmount}
              onChange={(e) =>
                setLoanAmount(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full bg-[#0e2f52] border border-[#1a4a73] rounded-lg pl-8 pr-3 py-2 text-[#e7f0ff] text-sm focus:outline-none focus:border-[#f6d44b] transition-colors"
              placeholder="400000"
            />
          </div>
        </div>

        <div>
          <label className="text-[#d9e7ff] text-xs font-bold mb-1 block">
            Interest Rate (%)
          </label>
          <input
            type="text"
            value={interestRate}
            onChange={(e) =>
              setInterestRate(e.target.value.replace(/[^0-9.]/g, ""))
            }
            className="w-full bg-[#0e2f52] border border-[#1a4a73] rounded-lg px-3 py-2 text-[#e7f0ff] text-sm focus:outline-none focus:border-[#f6d44b] transition-colors"
            placeholder="6.5"
          />
        </div>

        <div>
          <label className="text-[#d9e7ff] text-xs font-bold mb-1 block">
            Loan Term (Years)
          </label>
          <select
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className="w-full bg-[#0e2f52] border border-[#1a4a73] rounded-lg px-3 py-2 text-[#e7f0ff] text-sm focus:outline-none focus:border-[#f6d44b] transition-colors"
          >
            <option value="15">15 Years</option>
            <option value="20">20 Years</option>
            <option value="25">25 Years</option>
            <option value="30">30 Years</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="bg-[#08243f] rounded-lg p-3">
          <div className="text-[#d9e7ff] text-xs font-bold mb-1">
            Monthly Payment
          </div>
          <div className="text-[#f6d44b] text-lg font-extrabold">
            {formatCurrencyDetailed(monthlyPayment)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#08243f] rounded-lg p-3">
            <div className="text-[#d9e7ff] text-xs font-bold mb-1">
              Total Interest
            </div>
            <div className="text-[#e45765] text-sm font-extrabold">
              {formatCurrency(totalInterest)}
            </div>
          </div>
          <div className="bg-[#08243f] rounded-lg p-3">
            <div className="text-[#d9e7ff] text-xs font-bold mb-1">
              Total Payment
            </div>
            <div className="text-[#15a46a] text-sm font-extrabold">
              {formatCurrency(totalPayment)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setLoanAmount("300000");
            setInterestRate("6.0");
            setLoanTerm("30");
          }}
          className="bg-[#0e2f52] hover:bg-[#1a4a73] text-[#d9e7ff] text-xs font-bold py-2 px-3 rounded-lg transition-colors"
        >
          $300K Example
        </button>
        <button
          onClick={() => {
            setLoanAmount("500000");
            setInterestRate("7.0");
            setLoanTerm("30");
          }}
          className="bg-[#0e2f52] hover:bg-[#1a4a73] text-[#d9e7ff] text-xs font-bold py-2 px-3 rounded-lg transition-colors"
        >
          $500K Example
        </button>
      </div>
    </div>
  );
}
