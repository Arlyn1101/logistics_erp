import NoDataImg from "../../Assets/Images/no-data-dog.png"

import "./NoDataPrompt.css"

export default function NoDataPrompt() {
    return(
        <div className="no-data-cont">
            <img src={NoDataImg} alt="no data found" />
            <span>Uh Oh! No data found.</span>
        </div>
    )
}