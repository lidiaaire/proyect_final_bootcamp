import styles from "../../../styles/Comunicaciones.module.css";

export default function ChannelList({
  channels,
  selectedChannel,
  setSelectedChannel,
}) {
  return (
    <div className={styles.channelsPanel}>
      <div className={styles.panelHeader}>Canales</div>

      {channels.map((channel) => (
        <div
          key={channel}
          className={`${styles.channelItem} ${
            selectedChannel === channel ? styles.activeChannel : ""
          }`}
          onClick={() => setSelectedChannel(channel)}
        >
          <span className={styles.hash}>#</span> {channel}
        </div>
      ))}
    </div>
  );
}
