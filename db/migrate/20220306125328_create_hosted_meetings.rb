class CreateHostedMeetings < ActiveRecord::Migration[7.0]
  def change
    create_table :hosted_meetings do |t|
      t.references :meeting, null: false, foreign_key: true
      t.timestamp :started_at
      t.timestamp :ended_at
      t.integer :started_by
      t.jsonb :agenda, default: {}
      t.jsonb :slides, default: {}

      t.timestamps
    end
  end
end
