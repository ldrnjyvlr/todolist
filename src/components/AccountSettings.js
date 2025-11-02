import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AccountSettings() {
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setLoading(true);
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    const authUser = userData?.user;
    if (!authUser) {
      setLoading(false);
      return;
    }
    setEmail(authUser.email || "");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", authUser.id)
      .limit(1)
      .maybeSingle();

    if (profiles) {
      setProfileId(profiles.id);
      setUsername(profiles.username || "");
    }
    setLoading(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // Update username in profiles
    if (profileId) {
      await supabase.from("profiles").update({ username }).eq("id", profileId);
    }

    // Update password if provided
    if (newPassword.trim().length > 0) {
      const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
      if (passErr) {
        setMessage("Failed to update password: " + passErr.message);
        setSaving(false);
        return;
      }
    }

    setMessage("Saved successfully.");
    setNewPassword("");
    setSaving(false);
  };

  if (loading) {
    return <div className="account-settings">Loading settings...</div>;
  }

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      <form onSubmit={saveProfile} className="account-settings-form">
        <label className="form-label">
          <span>Email</span>
          <input
            value={email}
            readOnly
            className="form-input form-input-readonly"
          />
        </label>
        <label className="form-label">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="form-input"
          />
        </label>
        <label className="form-label">
          <span>New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className="form-input"
          />
        </label>
        <div className="account-settings-actions">
          <button
            type="submit"
            disabled={saving}
            className="btn-save-changes"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={loadCurrentUser}
            className="btn-reset"
          >
            Reset
          </button>
        </div>
        {message && <div className="account-settings-message">{message}</div>}
      </form>
    </div>
  );
}


