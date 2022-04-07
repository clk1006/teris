import styles from "./RoleBadge.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";

export default function RoleBadge({name, ghname, roleAddSuffix, roletype, role}) {
    return (
        <p>
            <span> {name}</span>
            {
                role.split(" ").map(x => {
                    if (roletype != "web" && roletype != "api") {
                        roletype = "";
                    } else {
                        roletype = roletype + " ";
                    }

                    if (roleAddSuffix != "ai") {
                        roleAddSuffix = "";
                    } else {
                        roleAddSuffix = "/algorithm";
                    }

                    return (
                        <span className={styles.roleBadge + " " + styles[x]}>{roletype.toUpperCase() + x.toUpperCase() + roleAddSuffix.toUpperCase()}</span>
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