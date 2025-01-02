import React from "react";

type KeyProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const ZeroKey = (props: KeyProps) => {
    const actionInput = () => {
        const numbers = props.input.split(/(?=[+\-×÷])/);
        console.log(numbers);
        if (
            numbers[numbers.length - 1] === "0" ||
            numbers[numbers.length - 1] === "+0" ||
            numbers[numbers.length - 1] === "-0"
        ) {
            // inputに含まれる数字のうち、最後の数字の最上位が0の場合、returnする
            return;
        }
        props.setInput((input) => input + "0");
    };

    return (
        <>
            <button className="key" onClick={() => actionInput()}>
                0
            </button>
        </>
    );
};

export default ZeroKey;
