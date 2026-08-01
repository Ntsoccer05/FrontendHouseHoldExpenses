import { Helmet } from "react-helmet-async";

const NoMatch = () => {
    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <div>このページはありません</div>
        </>
    );
};

export default NoMatch;
