class RemovePositionFromMeetingActions < ActiveRecord::Migration[7.0]
  def change

    remove_column :meeting_actions, :position

  end
end
