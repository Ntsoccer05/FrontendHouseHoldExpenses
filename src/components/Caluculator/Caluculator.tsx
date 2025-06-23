import { useEffect, useRef, useState } from "react";

// キーコンポーネント
interface KeyProps {
  character: string;
  onClick: (character: string) => void;
  className?: string;
}

const Key = ({ character, onClick, className = "key" }: KeyProps) => (
  <button className={className} onClick={() => onClick(character)}>
    {character}
  </button>
);

type CalculatorProps = {
  amount?: number;
  setShowCalculator?: (show: boolean) => void;
  onAmountChange?: (newValue: number) => void;
};

const Calculator = ({
  amount = 0,
  setShowCalculator = () => {},
  onAmountChange = () => {},
}: CalculatorProps) => {
  const [display, setDisplay] = useState<string>("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  
  const displayRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // 数字入力処理
  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} ${num}`);
      }
    } else {
      const newDisplay = display === "0" ? num : display + num;
      setDisplay(newDisplay);
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} ${newDisplay}`);
      }
    }
  };

  // 小数点入力処理
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} 0.`);
      }
    } else if (display.indexOf(".") === -1) {
      const newDisplay = display + ".";
      setDisplay(newDisplay);
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} ${newDisplay}`);
      }
    }
  };

  // 演算子入力処理（Windows電卓風）
  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${getOperatorSymbol(nextOperator)}`);
    } else if (operator) {
      // 演算子が入力待ち状態の場合は計算をスキップして演算子のみ切り替え
      if (waitingForOperand) {
        setExpression(`${previousValue} ${getOperatorSymbol(nextOperator)}`);
        setOperator(nextOperator);
        return;
      }
      
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);

      if (isNaN(newValue)) {
        return;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(`${newValue} ${getOperatorSymbol(nextOperator)}`);
      
      // 履歴に追加
      const historyEntry = `${currentValue} ${getOperatorSymbol(operator)} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // 最新10件まで保持
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  // 等号処理
  const performEquals = () => {
    if (operator && previousValue !== null) {
      const inputValue = parseFloat(display);
      const currentValue = previousValue;
      const newValue = calculate(currentValue, inputValue, operator);

      if (isNaN(newValue)) {
        return;
      }

      setDisplay(String(newValue));
      setExpression(`${currentValue} ${getOperatorSymbol(operator)} ${inputValue} =`);
      
      // 履歴に追加
      const historyEntry = `${currentValue} ${getOperatorSymbol(operator)} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  // 計算実行
  const calculate = (firstValue: number, secondValue: number, operator: string): number => {
    switch (operator) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        if (secondValue === 0) {
          throw new Error("Division by zero");
        }
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  // 演算子表示用シンボル取得
  const getOperatorSymbol = (op: string): string => {
    switch (op) {
      case "×": return "×";
      case "÷": return "÷";
      case "+": return "+";
      case "-": return "−";
      default: return op;
    }
  };

  // クリア処理
  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression("");
  };

  // 削除処理
  const deleteLast = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} ${newDisplay}`);
      }
    } else {
      setDisplay("0");
      if (operator && previousValue !== null) {
        setExpression(`${previousValue} ${getOperatorSymbol(operator)} 0`);
      }
    }
  };

  // プラスマイナス切り替え
  const toggleSign = () => {
    if (display !== "0") {
      setDisplay(display.charAt(0) === "-" ? display.slice(1) : "-" + display);
    }
  };

  // キー入力処理
  const handleKeyPress = (key: string) => {
    if (/\d/.test(key)) {
      inputNumber(key);
    } else if (key === ".") {
      inputDecimal();
    } else if (["+", "-", "×", "÷"].includes(key)) {
      performOperation(key);
    } else if (key === "=") {
      performEquals();
    } else if (key === "AC") {
      clear();
    } else if (key === "Del") {
      deleteLast();
    } else if (key === "±") {
      toggleSign();
    }
  };

  // 計算中かどうかを判定する関数
  const isCalculationInProgress = () => {
    return operator !== null && previousValue !== null && !waitingForOperand;
  };

  // 金額反映処理（計算中の場合は自動で計算完了させる）
  const reflectAmount = () => {
    let finalValue: number;
    
    // 計算中の場合は自動で計算を完了する
    if (isCalculationInProgress()) {
      const inputValue = parseFloat(display);
      const currentValue = previousValue || 0;
      finalValue = calculate(currentValue, inputValue, operator!);
      
      if (isNaN(finalValue)) {
        return;
      }
      
      // 履歴に追加
      const historyEntry = `${currentValue} ${getOperatorSymbol(operator!)} ${inputValue} = ${finalValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      // 計算機の状態をリセット
      setDisplay(String(finalValue));
      setExpression(`${currentValue} ${getOperatorSymbol(operator!)} ${inputValue} =`);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    } else {
      // 通常の場合はディスプレイの値を使用
      finalValue = parseFloat(display);
    }
    
    if (!isNaN(finalValue)) {
      onAmountChange(finalValue);
      setShowCalculator(false);
    }
  };

  // 履歴クリア
  const clearHistory = () => {
    setHistory([]);
  };

  // 履歴から値を選択
  const selectFromHistory = (historyItem: string) => {
    const match = historyItem.match(/= (.+)$/);
    if (match) {
      setDisplay(match[1]);
      setWaitingForOperand(true);
      setExpression("");
      setPreviousValue(null);
      setOperator(null);
    }
  };

  useEffect(() => {
    if (amount && amount !== 0) {
      setDisplay(String(amount));
    }
  }, [amount]);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [display]);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
      margin: '0px auto 20px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 履歴表示エリア */}
      <div style={{
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '5px',
        maxHeight: '150px',
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: 0, fontSize: '14px' }}>計算履歴</h4>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                padding: '2px 8px',
                fontSize: '12px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              クリア
            </button>
          )}
        </div>
        <div ref={historyRef}>
          {history.length === 0 ? (
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              履歴がありません
            </p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                onClick={() => selectFromHistory(item)}
                style={{
                  padding: '5px',
                  marginBottom: '2px',
                  fontSize: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#e3f2fd';
                  target.style.borderColor = '#2196F3';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#f9f9f9';
                  target.style.borderColor = 'transparent';
                }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ディスプレイ */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'black',
          color: 'white',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '5px',
          fontFamily: 'monospace'
        }}
      >
        {/* 式表示エリア */}
        <div
          style={{
            height: '25px',
            fontSize: '14px',
            textAlign: 'right',
            color: '#aaa',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
        >
          {expression}
        </div>
        
        {/* 結果表示エリア */}
        <div
          ref={displayRef}
          style={{
            height: '35px',
            fontSize: '24px',
            textAlign: 'right',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          {display}
        </div>
      </div>

      {/* キーパッド */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
        {/* 1行目 */}
        <Key character="AC" onClick={handleKeyPress} className="key operator" />
        <Key character="Del" onClick={handleKeyPress} className="key operator" />
        <Key character="±" onClick={handleKeyPress} className="key operator" />
        <Key character="÷" onClick={handleKeyPress} className="key operator" />
        
        {/* 2行目 */}
        <Key character="7" onClick={handleKeyPress} className="key" />
        <Key character="8" onClick={handleKeyPress} className="key" />
        <Key character="9" onClick={handleKeyPress} className="key" />
        <Key character="×" onClick={handleKeyPress} className="key operator" />
        
        {/* 3行目 */}
        <Key character="4" onClick={handleKeyPress} className="key" />
        <Key character="5" onClick={handleKeyPress} className="key" />
        <Key character="6" onClick={handleKeyPress} className="key" />
        <Key character="-" onClick={handleKeyPress} className="key operator" />
        
        {/* 4行目 */}
        <Key character="1" onClick={handleKeyPress} className="key" />
        <Key character="2" onClick={handleKeyPress} className="key" />
        <Key character="3" onClick={handleKeyPress} className="key" />
        <Key character="+" onClick={handleKeyPress} className="key operator" />
        
        {/* 5行目 */}
        <div style={{ gridColumn: 'span 2' }}>
          <Key character="0" onClick={handleKeyPress} className="key zero" />
        </div>
        <Key character="." onClick={handleKeyPress} className="key" />
        <Key character="=" onClick={handleKeyPress} className="key equals" />
      </div>

      {/* 金額入力ボタン */}
      <button
        style={{
          marginTop: "15px",
          width: "100%",
          height: "45px",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#1976D2";
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = "#2196F3";
        }}
        onClick={reflectAmount}
      >
        金額入力
      </button>

      <style dangerouslySetInnerHTML={{
        __html: `
          .key {
            height: 50px;
            border: 1px solid #ddd;
            background-color: #fff;
            font-size: 18px;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.1s;
          }
          
          .key:hover {
            background-color: #f0f0f0;
          }
          
          .key:active {
            background-color: #e0e0e0;
            transform: scale(0.95);
          }
          
          .key.operator {
            background-color: #ff9500;
            color: white;
          }
          
          .key.operator:hover {
            background-color: #ffad33;
          }
          
          .key.equals {
            background-color: #ff9500;
            color: white;
          }
          
          .key.equals:hover {
            background-color: #ffad33;
          }
          
          .key.zero {
            width: 100%;
            border-radius: 5px;
          }
        `
      }} />
    </div>
  );
};

export default Calculator;