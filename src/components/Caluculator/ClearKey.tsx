import React from "react";

type ClearKeyProps = {
    character: string;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
};

const ClearKey = (props: ClearKeyProps) => {
    const actionInput = () => {
        // inputをクリアする
        props.setInput("");
    };

    return (
        <>
            <button className="key key-wide" onClick={() => actionInput()}>
                {props.character}
            </button>
        </>
    );
};

export default ClearKey;
