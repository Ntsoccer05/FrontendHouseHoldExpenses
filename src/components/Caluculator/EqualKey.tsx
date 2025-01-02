import React from "react";
import BigNumber from "bignumber.js";

type KeyProps = {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const EqualKey = (props: KeyProps) => {
    // 計算処理
    const calculate = () => {
        return props.input
            .split(/(?=\+|(?<!÷)-)/)
            .map((block) => {
                // inputを+もしくは-ごとに分割する
                if (block.indexOf("×") !== -1 || block.indexOf("÷") !== -1) {
                    // ×もしくは÷を含むブロックを計算する
                    return block
                        .split(/(?=[×÷])/)
                        .reduce<BigNumber>((result: BigNumber, number) => {
                            if (number[0] === "×") {
                                return result.times(number.slice(1));
                            } else if (number[0] === "÷") {
                                return result.div(number.slice(1));
                            } else {
                                return result.times(number);
                            }
                        }, new BigNumber(1));
                }
                return block;
            })
            .reduce<BigNumber>((result: BigNumber, number) => {
                // 最後にすべてを足す
                return result.plus(number);
            }, new BigNumber(0));
    };

    const actionInput = () => {
        const operators = ["+", "-", "×", "÷"];
        const inputLastCharacter = props.input[props.input.length - 1];
        if (
            props.input === "" ||
            operators.includes(inputLastCharacter) ||
            inputLastCharacter === "."
        ) {
            // inputが空もしくはinputの最後の文字が演算子もしくは.だった場合、returnする
            return;
        }
        // 計算結果をinputにセットする
        const result = calculate();
        props.setInput(String(result));
    };

    return (
        <>
            <button className="key" onClick={() => actionInput()}>
                =
            </button>
        </>
    );
};

export default EqualKey;
