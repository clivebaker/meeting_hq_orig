class CreateMeetingActions < ActiveRecord::Migration[7.0]
  def change
    create_table :meeting_actions do |t|
      t.references :meeting, null: false, foreign_key: true
      t.string :name
      t.text :note
      t.integer :position
      t.string :state
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
