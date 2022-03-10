class AddHostedMeetingIdToMeetingActions < ActiveRecord::Migration[7.0]
  def change
    
    
    rename_column :meeting_actions, :note, :description

    remove_column :meeting_actions, :meeting_id
    rename_column :meeting_actions, :name, :action_type
    add_column :meeting_actions, :users, :jsonb, default: []


  end
end
