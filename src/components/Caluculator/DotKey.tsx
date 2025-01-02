import React from "react";

type KeyProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const DotKey = (props: KeyProps) => {
    const operators = ["+", "-", "×", "÷"];
    const inputLastCharacter = props.input[props.input.length - 1];
    const numbers = props.input.split(/(?=[+\-×÷])/);
    const actionInput = () => {
        if (props.input === "" || operators.includes(inputLastCharacter)) {
            // inputが空、もしくはinputの最後の文字が演算子の場合、returnする
            return;
        } else if (numbers[numbers.length - 1].indexOf(".") !== -1) {
            // inputに含まれる数字のうち、最後の数字に.が含まれる場合、returnする
            return;
        } else {
            // 末尾に.を加える
            props.setInput((input) => input + ".");
        }
    };

    return (
        <>
            <button className="key" onClick={() => actionInput()}>
                .
            </button>
        </>
    );
};

export default DotKey;
