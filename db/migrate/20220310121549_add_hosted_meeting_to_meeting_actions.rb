class AddHostedMeetingToMeetingActions < ActiveRecord::Migration[7.0]
  def change
    MeetingAction.delete_all
    add_reference :meeting_actions, :hosted_meeting, null: false, foreign_key: true
  end
end
