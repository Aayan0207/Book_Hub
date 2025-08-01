import React, {useState} from "react";
import Book from "./Book.jsx";
import "../assets/codex/codex.css";
function Card(payload){
    const [viewBook, setViewBook] = useState(false);

    if (viewBook && viewBook.match(/^(?:\d{10}|\d{13})$/)) {
        return <Book isbn={viewBook} />;
    }
    payload=payload.props;
    if (!payload || !payload.book.image.source) return;
    if (!payload.book.isbn.match(/^(?:\d{10}|\d{13})$/)) return;
    return (
        <>
        <div className={payload.book.parentClass}>
            <div className={payload.book.image.parentClass}>
                <img className={payload.book.image.class} src={payload.book.image.source}></img>
                {payload.user.isuser ? payload.book.options : null}
            </div>
            <div className={payload.book.info.parentClass} onClick={() => setViewBook(payload.book.isbn)}>
                <p className={payload.book.info.title.class}>{payload.book.info.title.value}</p>
                <p className={payload.book.info.author.class}>by {payload.book.info.author.value}</p>
                <div className={payload.book.info.ratings.parentClass}>
                    <div className={payload.book.info.ratings.bar.parentClass}>
                        <div className={`${payload.book.info.ratings.bar.class} progress progress-bar bg-warning`} style={{ width: `${payload.book.info.ratings.bar.value}%`}}></div>
                    </div>
                    <div className={payload.book.info.ratings.stars.parentClass}>
                        {Array(5).fill().map((_,index) => {
                            return(<div key={index} className={payload.book.info.ratings.stars.class}></div>);
                        })}
                    </div>
                    <div className={payload.book.info.ratings.data.parentClass}>
                        <p className={payload.book.info.ratings.data.class}>{payload.book.info.ratings.data.value}</p>
                    </div>
                </div>
                <p className={payload.book.info.publishInfo.class}>Published on: {payload.book.info.publishInfo.value}</p>
                <p className={payload.book.info.snippet.class}>{payload.book.info.snippet.value ? payload.book.info.snippet.value : "No snippet available."}</p>
            </div>
        </div>
        </>
    );
}

export default Card;