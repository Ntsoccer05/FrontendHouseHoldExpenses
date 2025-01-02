import React from "react";

type KeyProps = {
    character: string;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const DelKey = (props: KeyProps) => {
    const actionInput = () => {
        // inputの最後の文字を削除する
        props.setInput((input) => input.slice(0, -1));
    };

    return (
        <>
            <button className="key" onClick={() => actionInput()}>
                {props.character}
            </button>
        </>
    );
};

export default DelKey;
