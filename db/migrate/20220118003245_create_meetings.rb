class CreateMeetings < ActiveRecord::Migration[7.0]
  def change
    create_table :meetings do |t|
      t.references :organisation, null: false, foreign_key: true
      t.string :name

      t.timestamps
    end
  end
end
