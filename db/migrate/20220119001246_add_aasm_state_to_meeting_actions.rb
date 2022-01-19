class AddAasmStateToMeetingActions < ActiveRecord::Migration[7.0]
  def change
    remove_column :meeting_actions, :state
    add_column :meeting_actions, :aasm_state, :string
  end
end
