import React, { useEffect, useRef, useState } from "react";
import Key from "./Key";
import ZeroKey from "./ZeroKey";
import DotKey from "./DotKey";
import OperatorKey from "./OperatorKey";
import DelKey from "./DelKey";
import ClearKey from "./ClearKey";
import EqualKey from "./EqualKey";
import "../../assets/css/calculator.css"
import PlusMinusKey from "./PlusMinusKey";
import { Button } from "@mui/material";
import { safeEvaluate } from "../../utils/calculate";

type CaluculatorProps = {
    amount: number;
    setShowCalculator: React.Dispatch<React.SetStateAction<boolean>>;
    onAmountChange: (newValue: number) => void;
};

const Caluculator = ({
    amount,
    setShowCalculator,
    onAmountChange,
}: CaluculatorProps) => {
    const [input, setInput] = useState<string>(!!amount ? String(amount) : "");
    const inputRef = useRef(null);

    const reflectAmount = () => {
        const hasOperator = /[+\-×÷]/.test(input);

        let result = input;

        if (hasOperator) {
            try {
                const sanitized = input.replace(/×/g, "*").replace(/÷/g, "/");
                const evalResult = safeEvaluate(sanitized);
                result = String(evalResult);
                setInput(result);
            } catch (e) {
                alert("計算に失敗しました");
                return;
            }
        }

        onAmountChange(Number(result));
        setShowCalculator(false);
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
    }, [input]);

    return (
        <>
            <div className="container">
                <div className="calulator-display" ref={inputRef}>
                    {input}
                </div>
                <div className="key-rows">
                    <div className="key-row">
                        <ClearKey
                            character={"AC"}
                            input={input}
                            setInput={setInput}
                        />
                        <DelKey
                            character={"Del"}
                            input={input}
                            setInput={setInput}
                        />
                        <OperatorKey
                            character={"÷"}
                            input={input}
                            setInput={setInput}
                        />
                    </div>
                    <div className="key-row">
                        <Key
                            character={"7"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"8"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"9"}
                            input={input}
                            setInput={setInput}
                        />
                        <OperatorKey
                            character={"×"}
                            input={input}
                            setInput={setInput}
                        />
                    </div>
                    <div className="key-row">
                        <Key
                            character={"4"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"5"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"6"}
                            input={input}
                            setInput={setInput}
                        />
                        <OperatorKey
                            character={"-"}
                            input={input}
                            setInput={setInput}
                        />
                    </div>
                    <div className="key-row">
                        <Key
                            character={"1"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"2"}
                            input={input}
                            setInput={setInput}
                        />
                        <Key
                            character={"3"}
                            input={input}
                            setInput={setInput}
                        />
                        <OperatorKey
                            character={"+"}
                            input={input}
                            setInput={setInput}
                        />
                    </div>
                    <div className="key-row">
                        <PlusMinusKey input={input} setInput={setInput} />
                        <ZeroKey input={input} setInput={setInput} />
                        <DotKey input={input} setInput={setInput} />
                        <EqualKey input={input} setInput={setInput} />
                    </div>
                </div>
                <Button
                    variant="contained"
                    color={"primary"}
                    sx={{ marginTop: "15px", maxWidth: "220px" }}
                    fullWidth
                    onClick={reflectAmount}
                >
                    金額入力
                </Button>
            </div>
        </>
    );
};

export default Caluculator;
