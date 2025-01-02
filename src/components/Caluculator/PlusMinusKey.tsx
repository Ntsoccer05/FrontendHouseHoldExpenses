import React from "react";

type KeyProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const PlusMinusKey = (props: KeyProps) => {
    const operators = ["+", "-", "×", "÷"];
    const inputLastCharacter = props.input[props.input.length - 1];
    const numbers = props.input.split(/(?=[+\-×÷])/);
    const actionInput = () => {
        if (props.input === "" || operators.includes(inputLastCharacter)) {
            // inputが空、もしくはinputの最後の文字が演算子の場合、returnする
            return;
        }

        // 最後の数値部分を取得
        let lastNumber = numbers[numbers.length - 1];

        if (lastNumber.indexOf(".") !== -1) {
            // inputに含まれる数字のうち、最後の数字に.が含まれる場合、returnする
            return;
        }

        // 数値が負の値か正の値かを判定
        if (lastNumber.startsWith("-")) {
            // 負の場合、正に変換
            props.setInput((input) =>
                input.replace(/-\d+(\.\d+)?$/, lastNumber.slice(1))
            );
        } else {
            // 正の場合、負に変換
            props.setInput((input) =>
                input.replace(/\d+(\.\d+)?$/, `-${lastNumber}`)
            );
        }
    };

    return (
        <>
            <button className="key" onClick={() => actionInput()}>
                +/−
            </button>
        </>
    );
};

export default PlusMinusKey;
