import React, { useState } from "react";
import { Calculator, Delete } from "lucide-react";

interface BasicCalculatorWidgetProps {
  className?: string;
}

export default function BasicCalculatorWidget({
  className = "",
}: BasicCalculatorWidgetProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string,
  ) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const buttons = [
    ["C", "CE", "⌫", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const handleButtonClick = (value: string) => {
    switch (value) {
      case "C":
        clear();
        break;
      case "CE":
        clearEntry();
        break;
      case "⌫":
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay("0");
        }
        break;
      case "=":
        performCalculation();
        break;
      case "+":
      case "-":
      case "×":
      case "÷":
        inputOperation(value);
        break;
      case ".":
        inputDecimal();
        break;
      default:
        inputNumber(value);
        break;
    }
  };

  return (
    <div className={`bg-[#0b2a48] rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={16} className="text-[#e7f0ff]" />
        <h3 className="text-[#e7f0ff] font-extrabold">Calculator</h3>
      </div>

      {/* Display */}
      <div className="bg-[#08243f] rounded-lg p-3 mb-4">
        <div className="text-right text-[#e7f0ff] text-lg font-mono overflow-hidden">
          {display.length > 12 ? display.slice(-12) : display}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {row.map((button) => (
              <button
                key={button}
                onClick={() => handleButtonClick(button)}
                className={`h-10 rounded-lg text-sm font-bold transition-colors ${
                  button === "0" ? "col-span-2" : ""
                } ${
                  ["C", "CE", "⌫"].includes(button)
                    ? "bg-[#e45765] hover:bg-[#d63447] text-white"
                    : ["+", "-", "×", "÷", "="].includes(button)
                      ? "bg-[#f6d44b] hover:bg-[#f5d02b] text-[#14233b]"
                      : "bg-[#0e2f52] hover:bg-[#1a4a73] text-[#e7f0ff]"
                }`}
              >
                {button === "⌫" ? (
                  <Delete size={14} className="mx-auto" />
                ) : (
                  button
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
