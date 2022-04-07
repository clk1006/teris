import styles from "./RoleBadge.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";

export default function RoleBadge({name, ghname, roletype, role}) {
    return (
        <p>
            <span> {name}</span>
            {
                role.split(" ").map(x => {
                    let roleSuffix = "";

                    if (roletype != "web/ui" && roletype != "api") {
                        roletype = "";
                    } else {
                        roletype = roletype + " ";
                    }

                    if (x == "ai") {
                        roleSuffix = "/algorithm";
                    }

                    return (
                        <span className={styles.roleBadge + " " + styles[x]}>{roletype.toUpperCase() + x.toUpperCase() + roleSuffix.toUpperCase()}</span>
                    )
                })
            }
            {
                ghname != null &&

                <span>, <a href={"https://github.com/" + ghname}
                       className="text-link"
                       target="_blank" rel="noreferrer">{ghname} <FontAwesomeIcon
                        size="xs" icon={faExternalLink}/></a> on GitHub
                </span>
            }
        </p>
    )
}