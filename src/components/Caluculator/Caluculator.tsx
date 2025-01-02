import React, { useState } from "react";
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

type CaluculatorProps = {
    setShowCalculator: React.Dispatch<React.SetStateAction<boolean>>;
    onAmountChange: (newValue: number) => void;
};

const Caluculator = ({
    setShowCalculator,
    onAmountChange,
}: CaluculatorProps) => {
    const [input, setInput] = useState("");

    const reflectAmount = () => {
        onAmountChange(Number(input));
        setShowCalculator(false);
    };

    return (
        <>
            <div className="container">
                <input
                    className="calulator-display"
                    type="text"
                    value={input}
                    disabled
                />
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
                            character={"－"}
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
