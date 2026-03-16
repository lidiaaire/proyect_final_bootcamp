import styles from "../../../styles/Comunicaciones.module.css";

export default function MembersPanel({ members }) {
  return (
    <div className={styles.membersPanel}>
      <div className={styles.panelHeader}>Miembros</div>

      {members.map((member, index) => (
        <div key={index} className={styles.member}>
          <div className={styles.avatarSmall}>{member.avatar}</div>

          <div>
            <div className={styles.memberName}>{member.name}</div>

            <div className={styles.memberDept}>{member.department}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
