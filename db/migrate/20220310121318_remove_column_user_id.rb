class RemoveColumnUserId < ActiveRecord::Migration[7.0]
  def change

    remove_column :meeting_actions, :user_id

  end
end
